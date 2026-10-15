-- 002 — companies and students (ticket 04)
--
-- Run: npx supabase db query --linked -f supabase/sql/002-companies-and-students.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE.
--
-- Rules from docs/SPEC.md:
--   * Only a school's own coordinator reads and writes its companies and
--     students.
--   * Student emails are stored lowercase.
--   * Students are added only through the coordinator's roster upload.
--   (A student reading their OWN row comes later, in ticket 05.)

-- 1. Helper: which school does the signed-in coordinator belong to? ---
--
-- Returns null for anyone who is not a coordinator. "security definer"
-- lets it read the coordinators table on the user's behalf, but it only
-- ever answers about the CURRENT user (auth.uid()).

create or replace function current_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select school_id from public.coordinators where user_id = auth.uid()
$$;

revoke all on function current_school_id() from public, anon;
grant execute on function current_school_id() to authenticated;

-- 2. Companies --------------------------------------------------------
-- A partner company: one the coordinator already has a signed MOA with,
-- typed in by the coordinator and checked by no one.

create table if not exists companies (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  school_id       uuid not null default current_school_id()
                    references schools (id) on delete cascade,
  name            text not null check (char_length(trim(name)) between 1 and 120),
  supervisor_name text not null check (char_length(trim(supervisor_name)) between 1 and 120)
);

-- Same company name twice in one school is almost certainly a typo.
create unique index if not exists companies_school_name_idx
  on companies (school_id, lower(name));

-- 3. Students (the roster) -------------------------------------------

create table if not exists students (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  school_id       uuid not null default current_school_id()
                    references schools (id) on delete cascade,
  name            text not null check (char_length(trim(name)) between 1 and 120),
  student_no      text not null check (char_length(trim(student_no)) between 1 and 40),
  course          text not null check (char_length(trim(course)) between 1 and 120),
  -- Always lowercase, so a student's login email can be matched exactly.
  email           text not null check (email = lower(email) and position('@' in email) > 1),
  company_id      uuid not null references companies (id) on delete restrict,
  required_hours  integer not null check (required_hours between 1 and 2000),
  unique (school_id, student_no),
  unique (school_id, email)
);

create index if not exists students_school_idx on students (school_id);
create index if not exists students_company_idx on students (company_id);

-- 4. Row Level Security ----------------------------------------------

alter table companies enable row level security;
alter table students  enable row level security;

-- Companies: the school's coordinator may read, add and edit.
create policy "coordinators read own companies"
  on companies for select to authenticated
  using (school_id = (select current_school_id()));

create policy "coordinators add own companies"
  on companies for insert to authenticated
  with check (school_id = (select current_school_id()));

create policy "coordinators edit own companies"
  on companies for update to authenticated
  using (school_id = (select current_school_id()))
  with check (school_id = (select current_school_id()));

-- Students: same, plus a company must belong to the same school.
create policy "coordinators read own students"
  on students for select to authenticated
  using (school_id = (select current_school_id()));

create policy "coordinators add own students"
  on students for insert to authenticated
  with check (
    school_id = (select current_school_id())
    and company_id in (
      select id from companies where school_id = (select current_school_id())
    )
  );

create policy "coordinators edit own students"
  on students for update to authenticated
  using (school_id = (select current_school_id()))
  with check (
    school_id = (select current_school_id())
    and company_id in (
      select id from companies where school_id = (select current_school_id())
    )
  );

-- Deliberately NO delete policy on either table in the MVP.
-- Anonymous visitors have no policy at all, so they can do nothing.
