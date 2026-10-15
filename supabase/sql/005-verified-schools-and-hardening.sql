-- 005 — verified schools, and tighter permissions (from the code review)
--
-- Run: npx supabase db query --linked -f supabase/sql/005-verified-schools-and-hardening.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 004.
--
-- Why: sign-up is open, so anyone can create a "school" and put any email
-- on its roster. Without a check, a stranger could claim a classmate's
-- email and see (and approve) the classmate's hours. Now a school's
-- roster only works for students once the TEAM has verified that school.
-- This is the "admin verifies schools" idea from CONTEXT.md, done as one
-- yes/no column that only the team can change.
--
-- A coordinator can still sign up, name a school, add companies and
-- upload a roster before verification. Their students just cannot sign in
-- until the school is verified.

-- 1. The verified flag -----------------------------------------------

alter table schools
  add column if not exists verified boolean not null default false;

-- Coordinators may rename their school, but NEVER change `verified`.
-- Postgres lets us grant UPDATE on single columns, so we remove the
-- table-wide update right and give back only the name column.
revoke update on schools from authenticated;
grant update (name) on schools to authenticated;

-- To verify a school (team only, in the SQL Editor or the CLI):
--   update schools set verified = true where id = '<school id>';
-- To find the id:
--   select id, name, created_at from schools order by created_at;

-- 2. Roster matching now requires a verified school ------------------

create or replace function current_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.students s
  join public.schools sc on sc.id = s.school_id and sc.verified
  join auth.users u on lower(u.email) = s.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

create or replace function current_student_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.company_id
  from public.students s
  join public.schools sc on sc.id = s.school_id and sc.verified
  join auth.users u on lower(u.email) = s.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

-- 3. Trigger functions are not meant to be called by anyone ----------
--
-- They only ever run as triggers. Postgres checks the right to run a
-- trigger function when the trigger is CREATED, not each time it fires,
-- so removing these rights does not stop the triggers.

revoke execute on function time_entries_guard() from public, anon, authenticated;
revoke execute on function time_entries_audit() from public, anon, authenticated;

-- 4. Remove permissions the app never uses ---------------------------
--
-- Supabase gives its API roles broad table rights by default and relies
-- on Row Level Security to restrict them. RLS does not cover TRUNCATE, so
-- remove the rights that RLS cannot police.
--   * Signed-out visitors (anon) never use these tables: remove all.
--   * Signed-in users keep select/insert/update/delete, still limited by
--     RLS, but lose truncate, references and trigger.
-- A table created LATER gets Supabase's defaults again, so repeat this for
-- new tables (and grant anon `select` explicitly on any table that is
-- meant to be public, such as marketplace listings).

revoke all on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;
