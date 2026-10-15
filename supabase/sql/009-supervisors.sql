-- 009 — supervisors approve hours (ticket 10)
--
-- Run: npx supabase db query --linked -f supabase/sql/009-supervisors.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 008.
--
-- Decision from the team: the SUPERVISOR at a partner company approves or
-- rejects the hours of the students placed at THEIR company. The
-- coordinator can still approve, reject or change any decision (override).
--
-- How a supervisor gets access: the coordinator adds the supervisor's
-- email to a company (like adding students to a roster). The supervisor
-- signs up with that email, confirms it, and the database matches them by
-- the verified email of their login. Only in a VERIFIED school.
--
--   * A supervisor sees only their own companies' students' time entries.
--   * A supervisor never reads the students table directly (it holds
--     emails). They get name, ID, course, hours and company through a
--     narrow function instead.
--   * A supervisor can only change the decision, never the times, and
--     can never send an entry back to pending. The database stamps who
--     decided and when.
--   * A supervisor who is also one of those students cannot approve their
--     own hours.

-- 1. Who supervises which company --------------------------------------

create table if not exists company_supervisors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  school_id   uuid not null default current_school_id()
                references schools (id) on delete cascade,
  company_id  uuid not null references companies (id) on delete cascade,
  email       text not null check (email = lower(email) and position('@' in email) > 1),
  unique (company_id, email)
);

create index if not exists company_supervisors_school_idx on company_supervisors (school_id);

alter table company_supervisors enable row level security;

create policy "coordinators read own supervisors"
  on company_supervisors for select to authenticated
  using (school_id = (select current_school_id()));

create policy "coordinators add supervisors to own companies"
  on company_supervisors for insert to authenticated
  with check (
    school_id = (select current_school_id())
    and company_id in (
      select id from companies where school_id = (select current_school_id())
    )
  );

-- Removing a supervisor takes their access away.
create policy "coordinators remove own supervisors"
  on company_supervisors for delete to authenticated
  using (school_id = (select current_school_id()));

revoke all on company_supervisors from anon;
revoke update, truncate, references, trigger on company_supervisors from authenticated;

-- 2. Helpers: which companies / students does the signed-in supervisor have?

create or replace function current_supervisor_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select cs.company_id
  from public.company_supervisors cs
  join public.schools sc on sc.id = cs.school_id and sc.verified
  join auth.users u on lower(u.email) = cs.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

-- Students at those companies, EXCLUDING the supervisor themselves if they
-- are also a student, so nobody can approve their own hours.
create or replace function current_supervisor_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.students s
  where s.company_id in (select public.current_supervisor_company_ids())
    and s.id not in (select public.current_student_ids())
$$;

create or replace function is_supervisor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.current_supervisor_company_ids())
$$;

revoke all on function current_supervisor_company_ids() from public, anon;
revoke all on function current_supervisor_student_ids() from public, anon;
revoke all on function is_supervisor() from public, anon;
grant execute on function current_supervisor_company_ids() to authenticated;
grant execute on function current_supervisor_student_ids() to authenticated;
grant execute on function is_supervisor() to authenticated;

-- 3. What a supervisor may read ----------------------------------------

-- Their own companies.
create policy "supervisors read own companies"
  on companies for select to authenticated
  using (id in (select current_supervisor_company_ids()));

-- The time entries of their students, and the right to decide them.
create policy "supervisors read their students entries"
  on time_entries for select to authenticated
  using (student_id in (select current_supervisor_student_ids()));

create policy "supervisors decide their students entries"
  on time_entries for update to authenticated
  using (student_id in (select current_supervisor_student_ids()))
  with check (student_id in (select current_supervisor_student_ids()));

-- Their students, WITHOUT emails, with hours added up by the database.
create or replace function supervisor_students()
returns table (
  id             uuid,
  name           text,
  student_no     text,
  course         text,
  required_hours integer,
  company_id     uuid,
  approved_hours numeric,
  pending_count  bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.name, s.student_no, s.course, s.required_hours, s.company_id,
         coalesce(sum(extract(epoch from (t.time_out - t.time_in)) / 3600)
                  filter (where t.status = 'approved'), 0)::numeric(8, 2),
         count(t.id) filter (where t.status = 'pending')
  from public.students s
  left join public.time_entries t on t.student_id = s.id
  where s.id in (select public.current_supervisor_student_ids())
  group by s.id
  order by s.name
$$;

revoke all on function supervisor_students() from public, anon;
grant execute on function supervisor_students() to authenticated;

-- 4. The guard trigger now knows about supervisors ----------------------
--
-- Replaces the version from 004. Coordinators and supervisors are held to
-- the same rules: they can change the decision only.

create or replace function time_entries_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_decider boolean;
begin
  if tg_op = 'INSERT' then
    new.school_id := (select school_id from public.students where id = new.student_id);
    return new;
  end if;

  if new.student_id <> old.student_id or new.school_id <> old.school_id then
    raise exception 'An entry cannot be moved to another student';
  end if;

  -- No signed-in user means a trusted maintenance task.
  if auth.uid() is null then
    return new;
  end if;

  is_decider :=
    old.school_id is not distinct from public.current_school_id()
    or old.student_id in (select public.current_supervisor_student_ids());

  if is_decider then
    if new.work_date <> old.work_date
       or new.time_in <> old.time_in
       or new.time_out <> old.time_out then
      raise exception 'Approving or rejecting an entry cannot change its date or times';
    end if;

    if new.status = old.status then
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
      return new;
    end if;

    if new.status = 'pending' then
      raise exception 'An entry cannot be sent back to pending by an approver';
    end if;

    new.approved_by := auth.uid();
    new.approved_at := now();
  elsif new.status = 'pending' then
    -- A student resubmitting a rejected entry clears the old decision.
    new.approved_by := null;
    new.approved_at := null;
  end if;

  return new;
end;
$$;

-- 5. The change log records WHO KIND of person acted --------------------

alter table time_entry_changes add column if not exists actor_role text;

create or replace function time_entries_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor text;
begin
  if (old.status <> 'pending' or new.status <> 'pending')
     and (old.status, old.work_date, old.time_in, old.time_out)
         is distinct from (new.status, new.work_date, new.time_in, new.time_out)
  then
    actor := case
      when auth.uid() is null then 'system'
      when old.school_id is not distinct from public.current_school_id() then 'coordinator'
      when old.student_id in (select public.current_supervisor_student_ids()) then 'supervisor'
      when old.student_id in (select public.current_student_ids()) then 'student'
      else 'unknown'
    end;

    insert into public.time_entry_changes
      (entry_id, school_id, changed_by, actor_role, old_values, new_values)
    values (
      old.id,
      old.school_id,
      auth.uid(),
      actor,
      jsonb_build_object('status', old.status, 'work_date', old.work_date,
                         'time_in', old.time_in, 'time_out', old.time_out),
      jsonb_build_object('status', new.status, 'work_date', new.work_date,
                         'time_in', new.time_in, 'time_out', new.time_out)
    );
  end if;
  return new;
end;
$$;

-- Trigger functions are never called directly (same as 005).
revoke execute on function time_entries_guard() from public, anon, authenticated;
revoke execute on function time_entries_audit() from public, anon, authenticated;
