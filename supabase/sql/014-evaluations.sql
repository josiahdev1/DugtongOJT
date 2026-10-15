-- 014 — OJT evaluations (ticket 12)
--
-- Run: npx supabase db query --linked -f supabase/sql/014-evaluations.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 013.
--
-- The criteria and the 1-5 scale are copied from the school's own form
-- (templates/OJT-Evaluation-SY2526-Google-Forms.pdf).
--
-- Rules:
--   * The SUPERVISOR at the student's company fills in the evaluation. They
--     can come back and edit it; the last save is the one that counts.
--   * The school's COORDINATOR can read (and print) their own school's
--     evaluations, but cannot write or change them.
--   * Students cannot read it: the form promises the supervisor's comments
--     are treated confidentially.
--   * A supervisor cannot evaluate themselves (the helper from 009 leaves
--     out any student who is the signed-in user).
--   * The student's name, ID, course and company are copied onto the row by
--     the DATABASE when it is first saved, so the printed form always shows
--     what was true then. Who saved it and when are also set by the
--     database, never by the browser.
--   * One evaluation per student. It cannot be deleted.

-- 1. The table ---------------------------------------------------------

create table if not exists evaluations (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  student_id          uuid not null unique references students (id) on delete cascade,
  school_id           uuid not null references schools (id) on delete cascade,
  company_id          uuid not null references companies (id) on delete cascade,
  evaluated_by        uuid not null references auth.users (id),

  -- Copied from the student when first saved (the database fills these).
  trainee_name        text not null,
  student_no          text not null,
  course              text not null,
  company_name        text not null,

  -- Typed by the supervisor, as on the paper form.
  department          text not null check (char_length(trim(department)) between 1 and 120),
  supervisor_name     text not null check (char_length(trim(supervisor_name)) between 1 and 120),
  supervisor_position text not null check (char_length(trim(supervisor_position)) between 1 and 120),

  -- Professional Competence
  knowledge           smallint not null check (knowledge between 1 and 5),
  productivity        smallint not null check (productivity between 1 and 5),
  quality             smallint not null check (quality between 1 and 5),
  -- Work Ethics
  communication       smallint not null check (communication between 1 and 5),
  attendance          smallint not null check (attendance between 1 and 5),
  initiative          smallint not null check (initiative between 1 and 5),
  -- Character Traits
  coachability        smallint not null check (coachability between 1 and 5),
  adaptability        smallint not null check (adaptability between 1 and 5),
  interpersonal       smallint not null check (interpersonal between 1 and 5),
  appearance          smallint not null check (appearance between 1 and 5),

  strong_points       text not null check (char_length(trim(strong_points)) between 1 and 2000),
  improvements        text not null check (char_length(trim(improvements)) between 1 and 2000),
  comments            text not null default '' check (char_length(comments) <= 2000)
);

create index if not exists evaluations_school_idx on evaluations (school_id);
create index if not exists evaluations_company_idx on evaluations (company_id);

-- 2. Trigger: the database decides everything that matters -------------

create or replace function evaluations_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stu record;
begin
  if tg_op = 'INSERT' then
    select s.school_id, s.company_id, s.name, s.student_no, s.course, c.name as company_name
      into stu
    from public.students s
    join public.companies c on c.id = s.company_id
    where s.id = new.student_id;

    if not found then
      raise exception 'Unknown student';
    end if;

    new.school_id    := stu.school_id;
    new.company_id   := stu.company_id;
    new.trainee_name := stu.name;
    new.student_no   := stu.student_no;
    new.course       := stu.course;
    new.company_name := stu.company_name;
    new.created_at   := now();
  else
    -- An edit never moves the evaluation or rewrites what it recorded.
    new.student_id   := old.student_id;
    new.school_id    := old.school_id;
    new.company_id   := old.company_id;
    new.trainee_name := old.trainee_name;
    new.student_no   := old.student_no;
    new.course       := old.course;
    new.company_name := old.company_name;
    new.created_at   := old.created_at;
  end if;

  new.evaluated_by := auth.uid();
  new.updated_at   := now();
  return new;
end;
$$;

drop trigger if exists evaluations_guard_write on evaluations;
create trigger evaluations_guard_write
  before insert or update on evaluations
  for each row execute function evaluations_guard();

revoke execute on function evaluations_guard() from public, anon, authenticated;

-- 3. Row Level Security -------------------------------------------------

alter table evaluations enable row level security;

-- The supervisor reads the evaluations of their own students.
create policy "supervisors read their students evaluations"
  on evaluations for select to authenticated
  using (student_id in (select current_supervisor_student_ids()));

-- The coordinator reads their own school's evaluations.
create policy "coordinators read own evaluations"
  on evaluations for select to authenticated
  using (school_id = (select current_school_id()));

-- Only the supervisor writes, and only for their own students.
create policy "supervisors add their students evaluations"
  on evaluations for insert to authenticated
  with check (student_id in (select current_supervisor_student_ids()));

create policy "supervisors edit their students evaluations"
  on evaluations for update to authenticated
  using (student_id in (select current_supervisor_student_ids()))
  with check (student_id in (select current_supervisor_student_ids()));

-- Deliberately NO delete policy.

-- New tables get Supabase's broad default permissions, so remove what the
-- app never uses (same reasoning as 005).
revoke all on evaluations from anon;
revoke delete, truncate, references, trigger on evaluations from authenticated;
