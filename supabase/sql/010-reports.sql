-- 010 — misuse reports (ticket 11)
--
-- Run: npx supabase db query --linked -f supabase/sql/010-reports.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 009.
--
-- Team decisions:
--   * A report has three statuses: submitted, upheld, not_upheld.
--   * Only the school COORDINATOR moves it from submitted to upheld or
--     not_upheld, and the decision is FINAL. (No escalation to a Dugtong
--     admin for now.)
--   * The coordinator can see which student filed the report.
--   * A SUPERVISOR sees a report only after it is upheld, and never sees
--     the student's identity. A report that is not upheld is never shown
--     to the company.
--   * A student sees their own reports and their status.

-- 1. The table --------------------------------------------------------

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  student_id  uuid not null references students (id) on delete cascade,
  -- Both filled in by the database from the student's roster row.
  school_id   uuid not null references schools (id) on delete cascade,
  company_id  uuid not null references companies (id) on delete cascade,
  category    text not null check (category in
                ('out_of_scope_work', 'unsafe_conditions', 'unrecorded_overtime')),
  related_date date not null,
  description text not null check (char_length(trim(description)) between 10 and 2000),
  status      text not null default 'submitted'
                check (status in ('submitted', 'upheld', 'not_upheld')),
  decided_by  uuid references auth.users (id),
  decided_at  timestamptz
);

create index if not exists reports_school_idx on reports (school_id, status);
create index if not exists reports_student_idx on reports (student_id);
create index if not exists reports_company_idx on reports (company_id, status);

-- 2. Guard trigger ----------------------------------------------------

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

  -- UPDATE: only a decision, only once, only by the coordinator.
  if auth.uid() is null then
    return new;   -- trusted maintenance task
  end if;

  if old.status <> 'submitted' then
    raise exception 'A decided report is final';
  end if;
  if new.status not in ('upheld', 'not_upheld') then
    raise exception 'A report can only be upheld or not upheld';
  end if;
  if (new.student_id, new.school_id, new.company_id, new.category,
      new.related_date, new.description, new.created_at)
     is distinct from
     (old.student_id, old.school_id, old.company_id, old.category,
      old.related_date, old.description, old.created_at) then
    raise exception 'Only the decision can change on a report';
  end if;

  new.decided_by := auth.uid();
  new.decided_at := now();
  return new;
end;
$$;

create trigger reports_guard_insert
  before insert on reports
  for each row execute function reports_guard();
create trigger reports_guard_update
  before update on reports
  for each row execute function reports_guard();

revoke execute on function reports_guard() from public, anon, authenticated;

-- 3. Row Level Security ----------------------------------------------

alter table reports enable row level security;

-- A student files and reads their OWN reports. The date can be today or up
-- to 90 days back (Philippine time).
create policy "students file own reports"
  on reports for insert to authenticated
  with check (
    student_id in (select current_student_ids())
    and status = 'submitted'
    and decided_by is null
    and decided_at is null
    and related_date between
        ((now() at time zone 'Asia/Manila')::date - 90)
        and (now() at time zone 'Asia/Manila')::date
  );

create policy "students read own reports"
  on reports for select to authenticated
  using (student_id in (select current_student_ids()));

-- The coordinator reads their school's reports and decides them.
create policy "coordinators read own reports"
  on reports for select to authenticated
  using (school_id = (select current_school_id()));

create policy "coordinators decide own reports"
  on reports for update to authenticated
  using (school_id = (select current_school_id()) and status = 'submitted')
  with check (school_id = (select current_school_id()));

-- No policy for supervisors: they use the function below, which returns
-- only upheld reports and never the student.

revoke all on reports from anon;
revoke delete, truncate, references, trigger on reports from authenticated;

-- 4. What a supervisor may see ----------------------------------------
--
-- Upheld reports about THEIR company, without student_id, name or any
-- other way to identify who filed it. (The description is the student's
-- own words, so students are told not to put their name in it.)

create or replace function supervisor_upheld_reports()
returns table (
  id           uuid,
  company_id   uuid,
  category     text,
  related_date date,
  description  text,
  decided_at   timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.company_id, r.category, r.related_date, r.description, r.decided_at
  from public.reports r
  where r.status = 'upheld'
    and r.company_id in (select public.current_supervisor_company_ids())
  order by r.decided_at desc
$$;

revoke all on function supervisor_upheld_reports() from public, anon;
grant execute on function supervisor_upheld_reports() to authenticated;
