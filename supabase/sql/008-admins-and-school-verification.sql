-- 008 — platform admins, and a screen to verify schools (ticket 16)
--
-- Run: npx supabase db query --linked -f supabase/sql/008-admins-and-school-verification.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 007.
--
-- An ADMIN is a member of the Dugtong team. Admins are listed in the
-- `admins` table, which the team edits in SQL. Nobody can read or change
-- that table through the API, not even an admin. The app asks "am I an
-- admin?" through is_admin(), and admins do their work through the two
-- functions below. Each one checks is_admin() itself, so a normal user who
-- calls them gets an error.
--
-- To make someone an admin (they must already have signed up):
--   insert into admins (user_id)
--   select id from auth.users where email = 'person@example.com';
-- To remove one:
--   delete from admins where user_id = (select id from auth.users where email = 'person@example.com');

-- 1. The admins table -------------------------------------------------

create table if not exists admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
-- Deliberately NO policy: with RLS on and no policy, the API sees nothing.
revoke all on admins from anon, authenticated;

-- 2. "Am I an admin?" -------------------------------------------------

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke all on function is_admin() from public, anon;
grant execute on function is_admin() to authenticated;

-- 3. Admin: list every school, so the team can decide who to verify ---
--
-- Shows the coordinator's email (so the team can judge whether the school
-- is real) and how big the school's data already is.

create or replace function admin_list_schools()
returns table (
  id              uuid,
  name            text,
  created_at      timestamptz,
  verified        boolean,
  coordinator_email text,
  student_count   bigint,
  company_count   bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  return query
  select s.id, s.name, s.created_at, s.verified,
         (select u.email::text
            from public.coordinators c
            join auth.users u on u.id = c.user_id
           where c.school_id = s.id
           order by c.created_at
           limit 1),
         (select count(*) from public.students st where st.school_id = s.id),
         (select count(*) from public.companies co where co.school_id = s.id)
  from public.schools s
  order by s.verified, s.created_at;
end;
$$;

revoke all on function admin_list_schools() from public, anon;
grant execute on function admin_list_schools() to authenticated;

-- 4. Admin: verify or un-verify a school ------------------------------

create or replace function admin_set_school_verified(school uuid, is_verified boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  update public.schools set verified = is_verified where id = school;

  if not found then
    raise exception 'Unknown school';
  end if;
end;
$$;

revoke all on function admin_set_school_verified(uuid, boolean) from public, anon;
grant execute on function admin_set_school_verified(uuid, boolean) to authenticated;
