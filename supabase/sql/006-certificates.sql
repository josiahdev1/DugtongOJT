-- 006 — completion certificates (ticket 08)
--
-- Run: npx supabase db query --linked -f supabase/sql/006-certificates.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 005.
--
-- Rules:
--   * A certificate can only be issued once the student's APPROVED hours
--     reach their required hours. The DATABASE adds the hours up and
--     refuses otherwise, so a browser cannot talk its way past it.
--   * Only the coordinator of the student's school can issue one.
--   * One certificate per student. Once issued it cannot be edited or
--     deleted, so it always shows the values it was issued with.
--   * The hours, the date and who issued it are filled in by the
--     database, never taken from the browser.

-- 1. The table --------------------------------------------------------

create table if not exists certificates (
  id              uuid primary key default gen_random_uuid(),
  issued_at       timestamptz not null default now(),
  student_id      uuid not null unique references students (id) on delete cascade,
  school_id       uuid not null references schools (id) on delete cascade,
  issued_by       uuid not null references auth.users (id),
  hours_completed numeric(8, 2) not null,
  required_hours  integer not null
);

create index if not exists certificates_school_idx on certificates (school_id);

-- 2. Trigger: the database decides everything that matters ------------

create or replace function certificates_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stu record;
  approved numeric;
begin
  select school_id, required_hours into stu
  from public.students where id = new.student_id;

  if not found then
    raise exception 'Unknown student';
  end if;

  select coalesce(
           sum(extract(epoch from (time_out - time_in)) / 3600), 0)
    into approved
  from public.time_entries
  where student_id = new.student_id and status = 'approved';

  if approved < stu.required_hours then
    raise exception 'This student has not reached the required hours yet';
  end if;

  new.school_id       := stu.school_id;
  new.issued_by       := auth.uid();
  new.issued_at       := now();
  new.hours_completed := round(approved, 2);
  new.required_hours  := stu.required_hours;
  return new;
end;
$$;

create trigger certificates_guard_insert
  before insert on certificates
  for each row execute function certificates_guard();

revoke execute on function certificates_guard() from public, anon, authenticated;

-- 3. Row Level Security ----------------------------------------------

alter table certificates enable row level security;

-- The school's coordinator reads their own school's certificates.
create policy "coordinators read own certificates"
  on certificates for select to authenticated
  using (school_id = (select current_school_id()));

-- ...and issues one for their own school's student. (The trigger has
-- already set school_id from the student, so this check compares the
-- student's real school with the coordinator's.)
create policy "coordinators issue own certificates"
  on certificates for insert to authenticated
  with check (school_id = (select current_school_id()));

-- Deliberately NO update or delete policy: an issued certificate is final.

-- New tables get Supabase's broad default permissions, so remove what the
-- app never uses (same reasoning as 005).
revoke all on certificates from anon;
revoke update, delete, truncate, references, trigger on certificates from authenticated;
