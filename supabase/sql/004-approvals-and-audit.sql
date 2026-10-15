-- 004 — coordinator approves or rejects, and every decision is logged (ticket 06)
--
-- Run: npx supabase db query --linked -f supabase/sql/004-approvals-and-audit.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 003.
--
-- Rules from docs/SPEC.md and the team's answers:
--   * Only the coordinator of a student's school may approve or reject
--     that student's entries.
--   * "Approved by" and "approved at" are stamped by the DATABASE, never
--     taken from the browser.
--   * A coordinator can only change the decision. Dates and times belong
--     to the student.
--   * A student can fix a REJECTED entry and resubmit it; it goes back to
--     pending. An approved entry is locked for the student.
--   * Every decision, and every change after one, is recorded in an
--     append-only log with who, when, and the old and new values.
--   * Approved hours are added up by the database, not by the browser.

-- 1. Coordinator policies on time_entries -----------------------------

create policy "coordinators read own entries"
  on time_entries for select to authenticated
  using (school_id = (select current_school_id()));

-- The trigger below limits WHAT a coordinator may change (the decision
-- only). This policy limits WHOSE entries: their own school's.
create policy "coordinators decide own entries"
  on time_entries for update to authenticated
  using (school_id = (select current_school_id()))
  with check (school_id = (select current_school_id()));

-- 2. Students may fix a rejected entry --------------------------------

drop policy "students edit own pending entries" on time_entries;

create policy "students edit own entries until approved"
  on time_entries for update to authenticated
  using (
    student_id in (select current_student_ids())
    and status in ('pending', 'rejected')
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

-- 3. Replace the guard trigger from 003 -------------------------------
--
-- Runs before every insert and update on time_entries.

create or replace function time_entries_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_coordinator boolean;
begin
  if tg_op = 'INSERT' then
    new.school_id := (select school_id from public.students where id = new.student_id);
    return new;
  end if;

  if new.student_id <> old.student_id or new.school_id <> old.school_id then
    raise exception 'An entry cannot be moved to another student';
  end if;

  -- No signed-in user means a trusted maintenance task (for example
  -- someone running SQL in the dashboard). Row Level Security already
  -- stops every API caller from reaching this point without a user.
  if auth.uid() is null then
    return new;
  end if;

  is_coordinator := old.school_id is not distinct from public.current_school_id();

  if is_coordinator then
    if new.work_date <> old.work_date
       or new.time_in <> old.time_in
       or new.time_out <> old.time_out then
      raise exception 'A coordinator can approve or reject an entry, not change its date or times';
    end if;

    if new.status = old.status then
      -- Nothing was decided; leave the existing approval details alone.
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
      return new;
    end if;

    if new.status = 'pending' then
      raise exception 'A coordinator cannot send an entry back to pending';
    end if;

    -- The database records who decided and when. The browser cannot.
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

-- 4. Audit log: append-only ------------------------------------------

create table if not exists time_entry_changes (
  id          uuid primary key default gen_random_uuid(),
  changed_at  timestamptz not null default now(),
  -- No foreign key on purpose: the history must outlive the entry.
  entry_id    uuid not null,
  school_id   uuid not null,
  changed_by  uuid,
  old_values  jsonb not null,
  new_values  jsonb not null
);

create index if not exists time_entry_changes_entry_idx
  on time_entry_changes (entry_id);
create index if not exists time_entry_changes_school_idx
  on time_entry_changes (school_id, changed_at desc);

alter table time_entry_changes enable row level security;

-- The coordinator reads their own school's history. There is NO insert,
-- update or delete policy, so nobody can write or rewrite it through the
-- API. Only the trigger below can add rows.
create policy "coordinators read own school changes"
  on time_entry_changes for select to authenticated
  using (school_id = (select current_school_id()));

revoke insert, update, delete on time_entry_changes from anon, authenticated;
-- Anonymous visitors get no access to the log at all (not even an empty read).
revoke all on time_entry_changes from anon;

-- Logs every decision, and every change after one. A student editing a
-- still-pending entry is not logged (nothing has been decided yet).
create or replace function time_entries_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (old.status <> 'pending' or new.status <> 'pending')
     and (old.status, old.work_date, old.time_in, old.time_out)
         is distinct from (new.status, new.work_date, new.time_in, new.time_out)
  then
    insert into public.time_entry_changes
      (entry_id, school_id, changed_by, old_values, new_values)
    values (
      old.id,
      old.school_id,
      auth.uid(),
      jsonb_build_object('status', old.status, 'work_date', old.work_date,
                         'time_in', old.time_in, 'time_out', old.time_out),
      jsonb_build_object('status', new.status, 'work_date', new.work_date,
                         'time_in', new.time_in, 'time_out', new.time_out)
    );
  end if;
  return new;
end;
$$;

create trigger time_entries_audit_update
  after update on time_entries
  for each row execute function time_entries_audit();

-- 5. Hour totals, added up by the database ---------------------------
--
-- "security_invoker" makes the view obey Row Level Security as the person
-- asking, so a coordinator sees only their own school's students and a
-- student only themselves.

create or replace view student_hours
with (security_invoker = true) as
select
  s.id as student_id,
  coalesce(
    sum(extract(epoch from (t.time_out - t.time_in)) / 3600)
      filter (where t.status = 'approved'),
    0
  )::numeric(8, 2) as approved_hours,
  count(t.id) filter (where t.status = 'pending') as pending_count
from public.students s
left join public.time_entries t on t.student_id = s.id
group by s.id;

revoke all on student_hours from anon;
grant select on student_hours to authenticated;
