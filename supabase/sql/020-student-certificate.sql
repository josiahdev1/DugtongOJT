-- 020 — a student sees their own certificate (ticket 22)
--
-- Run: npx supabase db query --linked -f supabase/sql/020-student-certificate.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 019.
--
-- A student cannot read the `certificates` or `schools` tables, and should
-- not need to. This function returns only THEIR OWN certificate, with the
-- few things the page needs (the school's name, their company's name). It
-- reads what was stored when the certificate was issued, so it always shows
-- the same values.

create or replace function my_certificate()
returns table (
  issued_at       timestamptz,
  hours_completed numeric,
  required_hours  integer,
  student_name    text,
  student_no      text,
  course          text,
  company_name    text,
  school_name     text
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.issued_at, c.hours_completed, c.required_hours,
         s.name, s.student_no, s.course, co.name, sc.name
  from public.certificates c
  join public.students s on s.id = c.student_id
  join public.companies co on co.id = s.company_id
  join public.schools sc on sc.id = c.school_id
  where c.student_id in (select public.current_student_ids())
  order by c.issued_at desc
  limit 1
$$;

revoke all on function my_certificate() from public, anon;
grant execute on function my_certificate() to authenticated;
