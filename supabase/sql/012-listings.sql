-- 012 — company OJT listings, with a public browse view (ticket 14)
--
-- Run: npx supabase db query --linked -f supabase/sql/012-listings.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 011.
--
-- Team decisions:
--   * PUBLIC fields: company name, a "verified" label, course, number of
--     slots, required hours, schedule and hours per day, scope of tasks,
--     city or municipality, and an optional role title.
--   * NEVER public: contact details, documents, internal notes, assigned
--     students and trust scores.
--   * The course is chosen from a fixed list.
--   * A listing cannot be published without a scope of tasks, and only a
--     VERIFIED company can publish.
--   * Visitors can filter by course and by required hours (listings that
--     offer at least the hours entered).

-- 1. The fixed course list --------------------------------------------
--
-- A STARTER list of common programs. It is a table, so the team can add or
-- remove courses in SQL without changing the app:
--   insert into courses (name) values ('BS Marine Engineering');
-- Please confirm it against the pilot school's programs.

create table if not exists courses (
  name text primary key check (char_length(trim(name)) between 1 and 120)
);

alter table courses enable row level security;

create policy "anyone can read the course list"
  on courses for select to anon, authenticated
  using (true);

revoke all on courses from anon, authenticated;
grant select on courses to anon, authenticated;

insert into courses (name) values
  ('BS Information Technology'),
  ('BS Computer Science'),
  ('BS Information Systems'),
  ('BS Accountancy'),
  ('BS Business Administration'),
  ('BS Hospitality Management'),
  ('BS Tourism Management'),
  ('BS Civil Engineering'),
  ('BS Electrical Engineering'),
  ('BS Mechanical Engineering'),
  ('BS Architecture'),
  ('BS Nursing'),
  ('BS Psychology'),
  ('BS Education')
on conflict (name) do nothing;

-- 2. Listings ----------------------------------------------------------

create table if not exists listings (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  employer_id    uuid not null default current_employer_id()
                   references employers (id) on delete cascade,
  course         text not null references courses (name),
  slots          integer not null check (slots between 1 and 1000),
  required_hours integer not null check (required_hours between 1 and 2000),
  schedule       text not null check (char_length(trim(schedule)) between 1 and 200),
  hours_per_day  numeric(4, 2) not null check (hours_per_day > 0 and hours_per_day <= 24),
  city           text not null check (char_length(trim(city)) between 1 and 120),
  role_title     text check (role_title is null or char_length(trim(role_title)) between 1 and 120),
  scope_of_tasks text not null default '' check (char_length(scope_of_tasks) <= 4000),
  status         text not null default 'draft'
                   check (status in ('draft', 'published', 'closed')),
  published_at   timestamptz,
  -- A listing cannot leave "draft" without a real scope of tasks.
  check (status = 'draft' or char_length(trim(scope_of_tasks)) >= 20)
);

create index if not exists listings_employer_idx on listings (employer_id);
create index if not exists listings_public_idx on listings (status, course, required_hours);

-- 3. Guard trigger ------------------------------------------------------

create or replace function listings_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified boolean;
begin
  if tg_op = 'UPDATE' then
    if new.employer_id <> old.employer_id then
      raise exception 'A listing cannot move to another company';
    end if;
    if old.status <> 'draft' and new.status = 'draft' then
      raise exception 'A published listing cannot go back to draft';
    end if;
  end if;

  -- Only a verified company can publish. (Closing is always allowed.)
  if new.status = 'published' then
    select (status = 'verified') into verified
    from public.employers where id = new.employer_id;
    if verified is not true then
      raise exception 'Only a verified company can publish a listing';
    end if;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger listings_guard_write
  before insert or update on listings
  for each row execute function listings_guard();

revoke execute on function listings_guard() from public, anon, authenticated;

-- 4. Row Level Security: a company manages ITS OWN listings --------------

alter table listings enable row level security;

create policy "companies read own listings"
  on listings for select to authenticated
  using (employer_id = (select current_employer_id()));

create policy "companies add own listings"
  on listings for insert to authenticated
  with check (employer_id = (select current_employer_id()));

create policy "companies edit own listings"
  on listings for update to authenticated
  using (employer_id = (select current_employer_id()))
  with check (employer_id = (select current_employer_id()));

-- No delete policy: close a listing instead. Visitors have no access to
-- this table at all; they read the view below.
revoke all on listings from anon;
revoke delete, truncate, references, trigger on listings from authenticated;

-- 5. The PUBLIC view ------------------------------------------------------
--
-- This is the only thing signed-out visitors can read. It lists exactly the
-- public fields agreed with the team and nothing else: no owner, no email,
-- no representative, no documents, no notes, no students.
--
-- It runs with the view owner's rights on purpose (so visitors do not need
-- access to the tables underneath). The WHERE clause is what keeps it
-- safe: only PUBLISHED listings of VERIFIED companies appear, so a company
-- that is later rejected disappears at once.

create or replace view public_listings as
select
  l.id,
  l.employer_id,
  e.name        as company_name,
  true          as verified,
  l.course,
  l.slots,
  l.required_hours,
  l.schedule,
  l.hours_per_day,
  l.scope_of_tasks,
  l.city,
  l.role_title,
  l.published_at
from public.listings l
join public.employers e on e.id = l.employer_id
where l.status = 'published'
  and e.status = 'verified';

revoke all on public_listings from public, anon, authenticated;
grant select on public_listings to anon, authenticated;
