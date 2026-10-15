-- 017 — a company appeals an upheld report (ticket 19)
--
-- Run: npx supabase db query --linked -f supabase/sql/017-report-appeals.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 016.
--
-- Team decisions:
--   * The company's SUPERVISOR appeals an UPHELD report about their company,
--     once per report, with a written reason.
--   * A Dugtong ADMIN decides the appeal (`granted` or `denied`), final.
--   * Granted: the report becomes `not_upheld`. Denied: nothing changes.
--   * The admin never sees the student. The appeal keeps its own copy of
--     the report's category, date and text (no student), so the supervisor
--     can still read it after a granted appeal hides the report.

-- 1. The table ---------------------------------------------------------

create table if not exists report_appeals (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  report_id          uuid not null unique references reports (id) on delete cascade,
  school_id          uuid not null references schools (id) on delete cascade,
  company_id         uuid not null references companies (id) on delete cascade,
  appealed_by        uuid not null references auth.users (id),

  -- Copied from the report by the database (never the student).
  category           text not null,
  related_date       date not null,
  report_description text not null,

  reason             text not null check (char_length(trim(reason)) between 10 and 2000),
  status             text not null default 'submitted'
                       check (status in ('submitted', 'granted', 'denied')),
  decided_by         uuid references auth.users (id),
  decided_at         timestamptz
);

create index if not exists report_appeals_company_idx on report_appeals (company_id);
create index if not exists report_appeals_school_idx on report_appeals (school_id);

-- 2. Guard trigger ------------------------------------------------------

create or replace function report_appeals_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rep record;
begin
  if tg_op = 'INSERT' then
    select r.school_id, r.company_id, r.category, r.related_date,
           r.description, r.status
      into rep
    from public.reports r where r.id = new.report_id;

    if not found or rep.status <> 'upheld' then
      raise exception 'Only an upheld report can be appealed';
    end if;

    new.school_id          := rep.school_id;
    new.company_id         := rep.company_id;
    new.category           := rep.category;
    new.related_date       := rep.related_date;
    new.report_description := rep.description;
    new.appealed_by        := auth.uid();
    new.status             := 'submitted';
    new.decided_by         := null;
    new.decided_at         := null;
    new.created_at         := now();
    return new;
  end if;

  -- UPDATE: only an admin decides, only once.
  if auth.uid() is null then
    return new;   -- trusted maintenance task
  end if;
  if not public.is_admin() then
    raise exception 'Only a Dugtong admin can decide an appeal';
  end if;
  if old.status <> 'submitted' then
    raise exception 'A decided appeal is final';
  end if;
  if new.status not in ('granted', 'denied') then
    raise exception 'An appeal can only be granted or denied';
  end if;
  if (new.report_id, new.school_id, new.company_id, new.appealed_by,
      new.category, new.related_date, new.report_description,
      new.reason, new.created_at)
     is distinct from
     (old.report_id, old.school_id, old.company_id, old.appealed_by,
      old.category, old.related_date, old.report_description,
      old.reason, old.created_at) then
    raise exception 'Only the decision can change on an appeal';
  end if;

  new.decided_by := auth.uid();
  new.decided_at := now();
  return new;
end;
$$;

create trigger report_appeals_guard_write
  before insert or update on report_appeals
  for each row execute function report_appeals_guard();

revoke execute on function report_appeals_guard() from public, anon, authenticated;

-- 3. Row Level Security -------------------------------------------------

alter table report_appeals enable row level security;

-- The supervisor of the company reads and files its appeals. (The trigger
-- has already set company_id from the report, so the check compares the
-- report's real company with the supervisor's.)
create policy "supervisors read own appeals"
  on report_appeals for select to authenticated
  using (company_id in (select current_supervisor_company_ids()));

create policy "supervisors file own appeals"
  on report_appeals for insert to authenticated
  with check (company_id in (select current_supervisor_company_ids()));

-- The coordinator sees appeals about their own school's reports.
create policy "coordinators read own appeals"
  on report_appeals for select to authenticated
  using (school_id = (select current_school_id()));

-- Deliberately NO update or delete policy: admins decide through the
-- function below.

revoke all on report_appeals from anon;
revoke update, delete, truncate, references, trigger on report_appeals from authenticated;

-- 4. A granted appeal may take back an upheld decision -------------------
--
-- Replaces the version from 016. The ONLY new rule: an upheld report can
-- become `not_upheld`, by an admin, and only when its appeal was granted.

create or replace function reports_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stu record;
begin
  if tg_op = 'INSERT' then
    select school_id, company_id into stu
    from public.students where id = new.student_id;
    if not found then
      raise exception 'Unknown student';
    end if;
    new.school_id  := stu.school_id;
    new.company_id := stu.company_id;
    return new;
  end if;

  -- UPDATE
  if auth.uid() is null then
    return new;   -- trusted maintenance task
  end if;

  if (new.student_id, new.school_id, new.company_id, new.category,
      new.related_date, new.description, new.created_at)
     is distinct from
     (old.student_id, old.school_id, old.company_id, old.category,
      old.related_date, old.description, old.created_at) then
    raise exception 'Only the decision can change on a report';
  end if;

  if old.status = 'submitted' then
    -- The coordinator decides it, or escalates it.
    if new.status = 'escalated' then
      new.escalated_by := auth.uid();
      new.escalated_at := now();
      new.decided_by   := null;
      new.decided_at   := null;
    elsif new.status in ('upheld', 'not_upheld') then
      new.escalated_by := old.escalated_by;
      new.escalated_at := old.escalated_at;
      new.decided_by   := auth.uid();
      new.decided_at   := now();
    else
      raise exception 'A report can only be upheld, not upheld or escalated';
    end if;
  elsif old.status = 'escalated' then
    -- Only a Dugtong admin decides an escalated report.
    if not public.is_admin() then
      raise exception 'Only a Dugtong admin can decide an escalated report';
    end if;
    if new.status not in ('upheld', 'not_upheld') then
      raise exception 'An escalated report can only be upheld or not upheld';
    end if;
    new.escalated_by := old.escalated_by;
    new.escalated_at := old.escalated_at;
    new.decided_by   := auth.uid();
    new.decided_at   := now();
  elsif old.status = 'upheld'
        and new.status = 'not_upheld'
        and public.is_admin()
        and exists (select 1 from public.report_appeals a
                    where a.report_id = old.id and a.status = 'granted') then
    -- A granted appeal takes the decision back. Who first decided and
    -- when stays on the report.
    new.escalated_by := old.escalated_by;
    new.escalated_at := old.escalated_at;
    new.decided_by   := old.decided_by;
    new.decided_at   := old.decided_at;
  else
    raise exception 'A decided report is final';
  end if;

  return new;
end;
$$;

revoke execute on function reports_guard() from public, anon, authenticated;

-- 5. What an admin may see and do ---------------------------------------

create or replace function admin_pending_appeals()
returns table (
  id                 uuid,
  created_at         timestamptz,
  school_name        text,
  company_name       text,
  category           text,
  related_date       date,
  report_description text,
  reason             text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  return query
  select a.id, a.created_at, s.name, c.name, a.category, a.related_date,
         a.report_description, a.reason
  from public.report_appeals a
  join public.companies c on c.id = a.company_id
  join public.schools s on s.id = a.school_id
  where a.status = 'submitted'
  order by a.created_at;
end;
$$;

create or replace function admin_decide_appeal(appeal uuid, decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  rep uuid;
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if decision not in ('granted', 'denied') then
    raise exception 'An appeal can only be granted or denied';
  end if;

  update public.report_appeals
  set status = decision
  where id = appeal and status = 'submitted'
  returning report_id into rep;

  if not found then
    raise exception 'That appeal is not waiting for a decision';
  end if;

  if decision = 'granted' then
    update public.reports set status = 'not_upheld' where id = rep;
  end if;
end;
$$;

revoke all on function admin_pending_appeals() from public, anon;
revoke all on function admin_decide_appeal(uuid, text) from public, anon;
grant execute on function admin_pending_appeals() to authenticated;
grant execute on function admin_decide_appeal(uuid, text) to authenticated;
