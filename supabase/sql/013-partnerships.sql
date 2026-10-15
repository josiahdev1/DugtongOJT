-- 013 — partnerships between schools and companies (ticket 15)
--
-- Run: npx supabase db query --linked -f supabase/sql/013-partnerships.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 012.
--
-- Team decisions:
--   * A company the coordinator TYPES IN is an OFFLINE partner: a
--     partnership record created directly as ACCEPTED and marked offline
--     (no company account), based on an existing signed MOA.
--   * A PLATFORM partnership goes requested -> accepted or declined. No
--     other states.
--   * Either side can start a request. Only the RECEIVING side can accept
--     or decline, so a sender can never accept their own request.
--     (Offline partners are not an exception: no request exists, the MOA is
--     the agreement.)
--   * Students can only be deployed (assigned to a company) through an
--     ACCEPTED partnership, of either kind.
--   * Linking an offline partner to the same company when it later joins
--     the platform is parked in docs/LATER.md.
--
-- How it fits what already exists: a row in `companies` is the school's
-- placement company. Every row in `companies` now has an accepted
-- partnership behind it: offline ones get theirs from a trigger when the
-- coordinator types the company in; platform ones are created ONLY by
-- respond_to_partnership() below, when the receiving side accepts.

-- 1. A company row may be a platform company ---------------------------

alter table companies
  add column if not exists employer_id uuid references employers (id) on delete set null;

-- 2. Partnerships --------------------------------------------------------

create table if not exists partnerships (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  school_id    uuid not null references schools (id) on delete cascade,
  -- Null for an offline partner (no company account).
  employer_id  uuid references employers (id) on delete cascade,
  offline      boolean not null default false,
  -- Who started it: the school, or the company. Null for offline partners,
  -- because no request exists.
  requested_by text check (requested_by in ('school', 'employer')),
  status       text not null default 'requested'
                 check (status in ('requested', 'accepted', 'declined')),
  -- The school's placement company this partnership produced.
  company_id   uuid unique references companies (id) on delete set null,
  decided_by   uuid references auth.users (id),
  decided_at   timestamptz,
  check (
    (offline and employer_id is null and requested_by is null and status = 'accepted')
    or
    (not offline and employer_id is not null and requested_by is not null)
  )
);

-- One partnership between a school and a company, ever. A declined one
-- stays declined.
create unique index if not exists partnerships_pair_idx
  on partnerships (school_id, employer_id) where employer_id is not null;
create index if not exists partnerships_school_idx on partnerships (school_id, status);
create index if not exists partnerships_employer_idx on partnerships (employer_id, status);

-- No policies on purpose: with Row Level Security on and no policy, the API
-- sees nothing. Everything goes through the functions below.
alter table partnerships enable row level security;
revoke all on partnerships from anon, authenticated;

-- 3. Existing companies become offline partners -------------------------

insert into partnerships (school_id, offline, status, company_id)
select c.school_id, true, 'accepted', c.id
from companies c
where c.employer_id is null
  and not exists (select 1 from partnerships p where p.company_id = c.id);

-- 4. A company typed in by a coordinator is an offline partner ----------

create or replace function companies_offline_partnership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.employer_id is null then
    insert into public.partnerships (school_id, offline, status, company_id)
    values (new.school_id, true, 'accepted', new.id);
  end if;
  return new;
end;
$$;

create trigger companies_offline_partnership_insert
  after insert on companies
  for each row execute function companies_offline_partnership();

revoke execute on function companies_offline_partnership() from public, anon, authenticated;

-- A coordinator can only type in the plain details. They can never choose
-- `employer_id`: a platform company appears only when a partnership is
-- accepted.
revoke insert, update on companies from authenticated;
grant insert (name, supervisor_name, moa_signed_on, moa_expires_on) on companies to authenticated;
grant update (moa_signed_on, moa_expires_on) on companies to authenticated;

-- 5. Students can only be deployed through an accepted partnership ------

create or replace function students_require_partnership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.partnerships
    where company_id = new.company_id and status = 'accepted'
  ) then
    raise exception 'Students can only be deployed to a company through an accepted partnership';
  end if;
  return new;
end;
$$;

create trigger students_require_partnership_write
  before insert or update of company_id on students
  for each row execute function students_require_partnership();

revoke execute on function students_require_partnership() from public, anon, authenticated;

-- 6. A school asks a company ---------------------------------------------

create or replace function request_partnership(p_employer uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school uuid := public.current_school_id();
  new_id uuid;
begin
  if v_school is null then
    raise exception 'Only a school coordinator can request a partnership';
  end if;
  if not exists (select 1 from public.schools where id = v_school and verified) then
    raise exception 'Your school must be verified first';
  end if;
  if not exists (select 1 from public.employers where id = p_employer and status = 'verified') then
    raise exception 'That company is not verified';
  end if;

  insert into public.partnerships (school_id, employer_id, requested_by, status)
  values (v_school, p_employer, 'school', 'requested')
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception 'There is already a partnership or request with that company';
end;
$$;

-- 7. A company asks a school ---------------------------------------------

create or replace function request_partnership_with_school(p_school uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_employer uuid := public.current_employer_id();
  new_id uuid;
begin
  if v_employer is null then
    raise exception 'Only a company account can request a partnership';
  end if;
  if not public.employer_is_verified() then
    raise exception 'Your company must be verified first';
  end if;
  if not exists (select 1 from public.schools where id = p_school and verified) then
    raise exception 'That school is not verified';
  end if;

  insert into public.partnerships (school_id, employer_id, requested_by, status)
  values (p_school, v_employer, 'employer', 'requested')
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception 'There is already a partnership or request with that school';
end;
$$;

-- 8. Only the RECEIVING side can accept or decline -----------------------

create or replace function respond_to_partnership(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  emp record;
  receiving boolean;
  new_company uuid;
begin
  select * into p from public.partnerships where id = p_id for update;
  if not found then
    raise exception 'Unknown partnership';
  end if;
  if p.offline or p.status <> 'requested' then
    raise exception 'This request has already been answered';
  end if;

  -- The side that did NOT send the request is the side that answers it.
  if p.requested_by = 'school' then
    receiving := p.employer_id is not distinct from public.current_employer_id();
  else
    receiving := p.school_id is not distinct from public.current_school_id();
  end if;
  if not receiving then
    raise exception 'Only the side that received the request can answer it';
  end if;

  if p_accept then
    if not exists (select 1 from public.schools where id = p.school_id and verified) then
      raise exception 'The school is not verified';
    end if;
    if not exists (select 1 from public.employers where id = p.employer_id and status = 'verified') then
      raise exception 'The company is not verified';
    end if;

    select name, representative_name into emp from public.employers where id = p.employer_id;

    -- The school's placement company for this partner. If the coordinator
    -- already typed in a company with the same name, tell them apart.
    begin
      insert into public.companies (school_id, name, supervisor_name, employer_id)
      values (p.school_id, emp.name, emp.representative_name, p.employer_id)
      returning id into new_company;
    exception when unique_violation then
      insert into public.companies (school_id, name, supervisor_name, employer_id)
      values (p.school_id, emp.name || ' (platform)', emp.representative_name, p.employer_id)
      returning id into new_company;
    end;

    update public.partnerships
       set status = 'accepted', company_id = new_company,
           decided_by = auth.uid(), decided_at = now()
     where id = p_id;
  else
    update public.partnerships
       set status = 'declined', decided_by = auth.uid(), decided_at = now()
     where id = p_id;
  end if;
end;
$$;

-- 9. What each side may see ------------------------------------------------

-- The coordinator's view of every partnership of their school.
create or replace function school_partnerships()
returns table (
  id           uuid,
  employer_id  uuid,
  kind         text,
  company_name text,
  status       text,
  requested_by text,
  created_at   timestamptz,
  decided_at   timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.employer_id,
         case when p.offline then 'offline' else 'platform' end,
         coalesce(e.name, c.name),
         p.status, p.requested_by, p.created_at, p.decided_at
  from public.partnerships p
  left join public.employers e on e.id = p.employer_id
  left join public.companies c on c.id = p.company_id
  where p.school_id = public.current_school_id()
  order by (p.status = 'requested') desc, p.created_at desc
$$;

-- The company's view of its own platform partnerships.
create or replace function employer_partnerships()
returns table (
  id           uuid,
  school_id    uuid,
  school_name  text,
  status       text,
  requested_by text,
  created_at   timestamptz,
  decided_at   timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.school_id, s.name, p.status, p.requested_by, p.created_at, p.decided_at
  from public.partnerships p
  join public.schools s on s.id = p.school_id
  where p.employer_id = public.current_employer_id()
  order by (p.status = 'requested') desc, p.created_at desc
$$;

-- Verified schools a company may ask. Only the school's name is shown.
create or replace function verified_schools()
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.name
  from public.schools s
  where s.verified
    and public.employer_is_verified()
  order by s.name
$$;

-- 10. Who may call what ----------------------------------------------------

revoke all on function request_partnership(uuid) from public, anon;
revoke all on function request_partnership_with_school(uuid) from public, anon;
revoke all on function respond_to_partnership(uuid, boolean) from public, anon;
revoke all on function school_partnerships() from public, anon;
revoke all on function employer_partnerships() from public, anon;
revoke all on function verified_schools() from public, anon;
grant execute on function request_partnership(uuid) to authenticated;
grant execute on function request_partnership_with_school(uuid) to authenticated;
grant execute on function respond_to_partnership(uuid, boolean) to authenticated;
grant execute on function school_partnerships() to authenticated;
grant execute on function employer_partnerships() to authenticated;
grant execute on function verified_schools() to authenticated;
