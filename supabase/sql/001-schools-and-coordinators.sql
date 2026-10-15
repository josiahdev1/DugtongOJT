-- 001 — schools and coordinators (tickets 02 and 03)
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Every table has Row Level Security (RLS) ON with explicit policies.
--
-- Rules from docs/SPEC.md:
--   * A coordinator reads and updates only their own school.
--   * Any signed-in user may create a school, which then becomes theirs.
--   * A user can never link themselves to a school they did not create.

-- 1. Tables ---------------------------------------------------------

create table if not exists schools (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null check (char_length(trim(name)) between 1 and 120)
);

-- One row per coordinator: which school they belong to.
-- unique (user_id): in the MVP a coordinator belongs to exactly one school.
create table if not exists coordinators (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  school_id   uuid not null references schools (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists coordinators_school_id_idx on coordinators (school_id);

-- 2. Row Level Security --------------------------------------------

alter table schools enable row level security;
alter table coordinators enable row level security;

-- A coordinator may read their own coordinator row.
create policy "coordinators read own row"
  on coordinators for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A coordinator may read their own school.
create policy "coordinators read own school"
  on schools for select
  to authenticated
  using (
    id in (select school_id from coordinators where user_id = (select auth.uid()))
  );

-- A coordinator may rename their own school.
create policy "coordinators update own school"
  on schools for update
  to authenticated
  using (
    id in (select school_id from coordinators where user_id = (select auth.uid()))
  )
  with check (
    id in (select school_id from coordinators where user_id = (select auth.uid()))
  );

-- Deliberately NO insert or delete policy on either table: nobody can
-- add or remove rows directly through the API. Creating a school goes
-- through the function below, which does both inserts safely together.

-- 3. Create a school -------------------------------------------------
--
-- "security definer" means the function runs with the table owner's
-- rights, so it can do the two inserts that RLS would otherwise block.
-- It is safe because it only ever links the CURRENT signed-in user
-- (auth.uid()) to the school it just created, and does nothing if that
-- user already has a school.

create or replace function create_school(school_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_school_id uuid;
begin
  if uid is null then
    raise exception 'You must be signed in to create a school';
  end if;

  if exists (select 1 from public.coordinators where user_id = uid) then
    raise exception 'You already belong to a school';
  end if;

  insert into public.schools (name) values (school_name)
    returning id into new_school_id;

  insert into public.coordinators (user_id, school_id)
    values (uid, new_school_id);

  return new_school_id;
end;
$$;

-- Only signed-in users may call it, never anonymous visitors.
revoke all on function create_school(text) from public, anon;
grant execute on function create_school(text) to authenticated;

-- 4. Check it worked -------------------------------------------------
--
-- Table Editor: both tables should show RLS ENABLED. Any table showing
-- "RLS disabled" is a must-fix before the demo.
