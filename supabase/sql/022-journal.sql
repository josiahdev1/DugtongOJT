-- 022 — student journal (ticket 18)
--
-- Run: npx supabase db query --linked -f supabase/sql/022-journal.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 021.
--
-- Team decisions:
--   * One journal entry per day the student logged hours, text only.
--   * The COORDINATOR approves or rejects it. The supervisor can READ the
--     entries of their students but never approve them.
--   * The journal is SEPARATE from hours: approving hours does not need a
--     journal, and a journal does not approve hours.
--   * A student can write and edit an entry until it is APPROVED. Editing a
--     rejected entry sends it again for approval.
--
-- The database refuses an entry for a day the student never logged hours,
-- and fills in the school and the decision details itself.

-- 1. The table ---------------------------------------------------------

create table if not exists journal_entries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  student_id  uuid not null references students (id) on delete cascade,
  school_id   uuid not null references schools (id) on delete cascade,
  work_date   date not null,
  body        text not null check (char_length(trim(body)) between 20 and 2000),
  status      text not null default 'submitted'
                check (status in ('submitted', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 500),
  decided_by  uuid references auth.users (id),
  decided_at  timestamptz,
  unique (student_id, work_date)
);

create index if not exists journal_school_idx on journal_entries (school_id, status);
create index if not exists journal_student_idx on journal_entries (student_id, work_date desc);

-- 2. Guard trigger ------------------------------------------------------

create or replace function journal_entries_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stu_school uuid;
begin
  if tg_op = 'INSERT' then
    select school_id into stu_school from public.students where id = new.student_id;
    if stu_school is null then
      raise exception 'Unknown student';
    end if;
    if not exists (
      select 1 from public.time_entries
      where student_id = new.student_id and work_date = new.work_date
    ) then
      raise exception 'Log your hours for that day before writing its journal';
    end if;

    new.school_id   := stu_school;
    new.status      := 'submitted';
    new.review_note := null;
    new.decided_by  := null;
    new.decided_at  := null;
    new.created_at  := now();
    new.updated_at  := now();
    return new;
  end if;

  -- UPDATE
  if auth.uid() is null then
    return new;   -- trusted maintenance task
  end if;

  if (new.student_id, new.school_id, new.work_date, new.created_at)
     is distinct from
     (old.student_id, old.school_id, old.work_date, old.created_at) then
    raise exception 'A journal entry cannot move to another day or student';
  end if;

  if old.student_id in (select public.current_student_ids()) then
    -- The student edits the text until it is approved. An edit sends it
    -- again for approval.
    if old.status = 'approved' then
      raise exception 'An approved journal entry is locked';
    end if;
    new.status      := 'submitted';
    new.review_note := null;
    new.decided_by  := null;
    new.decided_at  := null;
  elsif old.school_id is not distinct from public.current_school_id() then
    -- The coordinator decides, and cannot rewrite the student's words.
    if new.body <> old.body then
      raise exception 'The coordinator cannot change what the student wrote';
    end if;
    if old.status <> 'submitted' then
      raise exception 'This entry has already been decided';
    end if;
    if new.status not in ('approved', 'rejected') then
      raise exception 'An entry can only be approved or rejected';
    end if;
    new.decided_by := auth.uid();
    new.decided_at := now();
  else
    raise exception 'You cannot change this journal entry';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists journal_entries_guard_write on journal_entries;
create trigger journal_entries_guard_write
  before insert or update on journal_entries
  for each row execute function journal_entries_guard();

revoke execute on function journal_entries_guard() from public, anon, authenticated;

-- 3. Row Level Security -------------------------------------------------

alter table journal_entries enable row level security;

create policy "students read own journal"
  on journal_entries for select to authenticated
  using (student_id in (select current_student_ids()));

create policy "students write own journal"
  on journal_entries for insert to authenticated
  with check (student_id in (select current_student_ids()));

create policy "students edit own journal until approved"
  on journal_entries for update to authenticated
  using (student_id in (select current_student_ids()) and status <> 'approved')
  with check (student_id in (select current_student_ids()));

create policy "coordinators read own school journal"
  on journal_entries for select to authenticated
  using (school_id = (select current_school_id()));

create policy "coordinators decide own school journal"
  on journal_entries for update to authenticated
  using (school_id = (select current_school_id()) and status = 'submitted')
  with check (school_id = (select current_school_id()));

-- Supervisors READ the journal of their own students. No write policy.
create policy "supervisors read their students journal"
  on journal_entries for select to authenticated
  using (student_id in (select current_supervisor_student_ids()));

revoke all on journal_entries from anon;
revoke delete, truncate, references, trigger on journal_entries from authenticated;
