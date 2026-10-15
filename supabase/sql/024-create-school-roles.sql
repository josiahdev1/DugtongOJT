-- 024 — Only people who are not already something else can create a school.
--
-- Security review F-07: create_school() could be called by ANY signed-in
-- user, so a student on a roster, a supervisor or a company account could
-- turn themselves into a school coordinator. This keeps the same function
-- (same name, same signature, same grants) and adds three refusals.
--
-- Run this in the Supabase SQL editor. It is safe to run twice.

create or replace function create_school(school_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  my_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  new_school_id uuid;
begin
  if uid is null then
    raise exception 'You must be signed in to create a school';
  end if;

  if exists (select 1 from public.coordinators where user_id = uid) then
    raise exception 'You already belong to a school';
  end if;

  -- A student on a school's roster uses the student workspace instead.
  if my_email <> '' and exists (
    select 1 from public.students where email = my_email
  ) then
    raise exception 'This email is on a student roster, so it cannot create a school';
  end if;

  -- A company account or a company supervisor is not a school coordinator.
  if exists (select 1 from public.employers where owner_id = uid) then
    raise exception 'A company account cannot create a school';
  end if;

  if my_email <> '' and exists (
    select 1 from public.company_supervisors where email = my_email
  ) then
    raise exception 'A supervisor account cannot create a school';
  end if;

  insert into public.schools (name) values (school_name)
    returning id into new_school_id;

  insert into public.coordinators (user_id, school_id)
    values (uid, new_school_id);

  return new_school_id;
end;
$$;

revoke all on function create_school(text) from public, anon;
grant execute on function create_school(text) to authenticated;
