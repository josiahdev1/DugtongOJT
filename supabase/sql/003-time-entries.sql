-- 003 — students sign in and log their hours (ticket 05)
--
-- Run: npx supabase db query --linked -f supabase/sql/003-time-entries.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE.
--
-- Rules from docs/SPEC.md and the team's answers:
--   * A student is matched to their roster row by the VERIFIED email of
--     their login, never by anything the browser sends.
--   * A student sees and logs only their own hours, always as "pending".
--   * A student may edit an entry only while it is pending.
--   * One entry per student per day. The date can be today or up to 30
--     days back, in Philippine time (Asia/Manila).
--   * An email that is not on any roster sees nothing.
--   (The coordinator approving entries comes in ticket 06.)

-- 1. Helper: which roster rows belong to the signed-in user? ---------
--
-- Looks the user up in auth.users and requires email_confirmed_at, so
-- an account that never clicked its confirmation link matches nothing.
-- Returns a SET of ids: if a second school ever adds the same email,
-- that person simply has two roster rows.

create or replace function current_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.students s
  join auth.users u on lower(u.email) = s.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

revoke all on function current_student_ids() from public, anon;
grant execute on function current_student_ids() to authenticated;

-- Same idea for companies: which companies do my roster rows point at?
-- This is a helper (not a plain subquery on students) on purpose: the
-- students insert rule already looks at companies, so a companies rule
-- that looked back at students would make Postgres loop forever
-- ("infinite recursion detected in policy").

create or replace function current_student_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.company_id
  from public.students s
  join auth.users u on lower(u.email) = s.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

revoke all on function current_student_company_ids() from public, anon;
grant execute on function current_student_company_ids() to authenticated;

-- 2. Time entries -----------------------------------------------------

create table if not exists time_entries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  student_id  uuid not null references students (id) on delete cascade,
  -- Copied from the student's roster row by a trigger below, so the
  -- browser can never choose it.
  school_id   uuid not null references schools (id) on delete cascade,
  work_date   date not null,
  time_in     time not null,
  time_out    time not null,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  check (time_out > time_in),
  unique (student_id, work_date)
);

create index if not exists time_entries_student_idx on time_entries (student_id);
create index if not exists time_entries_school_idx  on time_entries (school_id);

-- 3. Trigger: school comes from the student, and who/what can't move --

create or replace function time_entries_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.school_id := (select school_id from public.students where id = new.student_id);
  elsif new.student_id <> old.student_id or new.school_id <> old.school_id then
    raise exception 'An entry cannot be moved to another student';
  end if;
  return new;
end;
$$;

create trigger time_entries_guard_insert
  before insert on time_entries
  for each row execute function time_entries_guard();

create trigger time_entries_guard_update
  before update on time_entries
  for each row execute function time_entries_guard();

-- 4. Row Level Security ----------------------------------------------

alter table time_entries enable row level security;

-- A student reads their own roster row and their own company.
create policy "students read own roster row"
  on students for select to authenticated
  using (id in (select current_student_ids()));

create policy "students read own company"
  on companies for select to authenticated
  using (id in (select current_student_company_ids()));

-- A student reads their own entries.
create policy "students read own entries"
  on time_entries for select to authenticated
  using (student_id in (select current_student_ids()));

-- A student logs an entry for themselves: always pending, never
-- pre-approved, dated today or up to 30 days back (Philippine time).
create policy "students log own entries"
  on time_entries for insert to authenticated
  with check (
    student_id in (select current_student_ids())
    and status = 'pending'
    and approved_by is null
    and approved_at is null
    and work_date between
        ((now() at time zone 'Asia/Manila')::date - 30)
        and (now() at time zone 'Asia/Manila')::date
  );

-- A student edits an entry only while it is pending, and can never make
-- it approved themselves.
create policy "students edit own pending entries"
  on time_entries for update to authenticated
  using (
    student_id in (select current_student_ids())
    and status = 'pending'
  )
  with check (
    student_id in (select current_student_ids())
    and status = 'pending'
    and approved_by is null
    and approved_at is null
    and work_date between
        ((now() at time zone 'Asia/Manila')::date - 30)
        and (now() at time zone 'Asia/Manila')::date
  );

-- Deliberately NO delete policy, and no coordinator policy yet.
-- Anonymous visitors have no policy at all, so they can do nothing.
