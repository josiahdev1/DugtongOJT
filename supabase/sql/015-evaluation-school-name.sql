-- 015 — remember the school's name on each evaluation (ticket 12)
--
-- Run: npx supabase db query --linked -f supabase/sql/015-evaluation-school-name.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 014.
--
-- The saved PDF is named "Student Name - School - Evaluation.pdf". A
-- supervisor cannot read the schools table, so the DATABASE copies the
-- school's name onto the evaluation when it is first saved, the same way
-- it already copies the student's name and company. Evaluations saved
-- before this change are filled in from their school.

alter table evaluations add column if not exists school_name text;

-- The guard trigger would overwrite who saved the evaluation (there is no
-- signed-in user here), so it is paused for this one-time backfill.
alter table evaluations disable trigger evaluations_guard_write;

update evaluations e
set school_name = sc.name
from schools sc
where sc.id = e.school_id and e.school_name is null;

alter table evaluations enable trigger evaluations_guard_write;

alter table evaluations alter column school_name set not null;

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
    select s.school_id, s.company_id, s.name, s.student_no, s.course,
           c.name as company_name, sc.name as school_name
      into stu
    from public.students s
    join public.companies c on c.id = s.company_id
    join public.schools sc on sc.id = s.school_id
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
    new.school_name  := stu.school_name;
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
    new.school_name  := old.school_name;
    new.created_at   := old.created_at;
  end if;

  new.evaluated_by := auth.uid();
  new.updated_at   := now();
  return new;
end;
$$;

-- Trigger functions are never called directly (same as 014).
revoke execute on function evaluations_guard() from public, anon, authenticated;
