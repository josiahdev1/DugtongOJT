-- 016 — escalate misuse reports to a Dugtong admin (ticket 17)
--
-- Run: npx supabase db query --linked -f supabase/sql/016-escalated-reports.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 015.
--
-- Team decisions:
--   * A coordinator can escalate a report that is still `submitted`. It
--     becomes `escalated`. Only a Dugtong admin can then uphold or not
--     uphold it, and that decision is final.
--   * The admin never sees which student filed a report.
--   * A company with 3 upheld reports is flagged automatically. An admin
--     marks it `under_review` or restores it (`none`). After a restore, only
--     reports upheld LATER count towards the next flag.
--   * `under_review` is a label. It does not block placements.

-- 1. Reports get a fourth status ---------------------------------------

alter table reports drop constraint if exists reports_status_check;
alter table reports add constraint reports_status_check
  check (status in ('submitted', 'escalated', 'upheld', 'not_upheld'));

alter table reports add column if not exists escalated_by uuid references auth.users (id);
alter table reports add column if not exists escalated_at timestamptz;

-- 2. Companies carry a review state -------------------------------------
--
-- Coordinators can still only change the MOA dates (013): column-level
-- grants mean they cannot touch these new columns.

alter table companies
  add column if not exists review_state text not null default 'none'
    check (review_state in ('none', 'flagged', 'under_review')),
  add column if not exists review_changed_at timestamptz,
  add column if not exists review_cleared_at timestamptz;

-- 3. Guard trigger: who may do what to a report -------------------------

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
  else
    raise exception 'A decided report is final';
  end if;

  return new;
end;
$$;

revoke execute on function reports_guard() from public, anon, authenticated;

-- 4. Flag a company by itself at 3 upheld reports -----------------------

create or replace function reports_flag_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleared timestamptz;
  upheld  integer;
begin
  if new.status = 'upheld' and old.status <> 'upheld' then
    select review_cleared_at into cleared
    from public.companies where id = new.company_id;

    select count(*) into upheld
    from public.reports
    where company_id = new.company_id
      and status = 'upheld'
      and (cleared is null or decided_at > cleared);

    -- 3 is the team's number for "reported repeatedly".
    if upheld >= 3 then
      update public.companies
      set review_state = 'flagged', review_changed_at = now()
      where id = new.company_id and review_state = 'none';
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists reports_flag_company_update on reports;
create trigger reports_flag_company_update
  after update of status on reports
  for each row execute function reports_flag_company();

revoke execute on function reports_flag_company() from public, anon, authenticated;

-- Companies that already have 3 upheld reports are flagged now.
update companies c
set review_state = 'flagged', review_changed_at = now()
where c.review_state = 'none'
  and (select count(*) from reports r
       where r.company_id = c.id and r.status = 'upheld') >= 3;

-- 5. What an admin may see and do ---------------------------------------
--
-- Admins have no policy on `reports`: they use these functions, which
-- never return the student. Each one checks is_admin() itself (like 008).

create or replace function admin_escalated_reports()
returns table (
  id           uuid,
  escalated_at timestamptz,
  school_name  text,
  company_id   uuid,
  company_name text,
  category     text,
  related_date date,
  description  text
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
  select r.id, r.escalated_at, s.name, c.id, c.name,
         r.category, r.related_date, r.description
  from public.reports r
  join public.companies c on c.id = r.company_id
  join public.schools s on s.id = r.school_id
  where r.status = 'escalated'
  order by r.escalated_at;
end;
$$;

create or replace function admin_decide_report(report uuid, decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if decision not in ('upheld', 'not_upheld') then
    raise exception 'A report can only be upheld or not upheld';
  end if;

  -- Only escalated reports: an admin never decides one the coordinator
  -- still has.
  update public.reports
  set status = decision
  where id = report and status = 'escalated';

  if not found then
    raise exception 'That report is not escalated';
  end if;
end;
$$;

create or replace function admin_flagged_companies()
returns table (
  company_id        uuid,
  company_name      text,
  school_name       text,
  review_state      text,
  review_changed_at timestamptz,
  upheld_count      bigint,
  reports           jsonb
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
  select c.id, c.name, s.name, c.review_state, c.review_changed_at,
         count(r.id),
         coalesce(
           jsonb_agg(
             jsonb_build_object(
               'category', r.category,
               'related_date', r.related_date,
               'description', r.description)
             order by r.decided_at desc)
           filter (where r.id is not null),
           '[]'::jsonb)
  from public.companies c
  join public.schools s on s.id = c.school_id
  left join public.reports r
    on r.company_id = c.id
   and r.status = 'upheld'
   and (c.review_cleared_at is null or r.decided_at > c.review_cleared_at)
  where c.review_state <> 'none'
  group by c.id, s.name
  order by (c.review_state = 'flagged') desc, c.review_changed_at desc;
end;
$$;

create or replace function admin_set_company_review(company uuid, new_state text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if new_state not in ('under_review', 'none') then
    raise exception 'A company can be put under review or restored';
  end if;

  update public.companies
  set review_state = new_state,
      review_changed_at = now(),
      review_cleared_at = case when new_state = 'none' then now()
                               else review_cleared_at end
  where id = company and review_state <> 'none';

  if not found then
    raise exception 'That company is not flagged';
  end if;
end;
$$;

revoke all on function admin_escalated_reports() from public, anon;
revoke all on function admin_decide_report(uuid, text) from public, anon;
revoke all on function admin_flagged_companies() from public, anon;
revoke all on function admin_set_company_review(uuid, text) from public, anon;
grant execute on function admin_escalated_reports() to authenticated;
grant execute on function admin_decide_report(uuid, text) to authenticated;
grant execute on function admin_flagged_companies() to authenticated;
grant execute on function admin_set_company_review(uuid, text) to authenticated;
