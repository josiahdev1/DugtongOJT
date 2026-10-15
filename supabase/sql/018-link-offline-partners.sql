-- 018 — link an offline partner to the same company on the platform (ticket 20)
--
-- Run: npx supabase db query --linked -f supabase/sql/018-link-offline-partners.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 017.
--
-- Team decisions:
--   * The COORDINATOR proposes, the COMPANY accepts. Nothing changes until it
--     accepts (linking gives the company's account access to the students
--     placed there).
--   * Accepting changes the EXISTING company row (it gets the company's
--     employer_id) and turns its offline partnership into a platform one.
--     Students, hours, reports, evaluations, MOA dates and supervisors stay
--     exactly where they are.
--   * Only a verified company that has NO partnership or request with the
--     school yet can be linked.
--   * One live (requested or accepted) link per offline company. A declined
--     request can be sent again.
--
-- Like `partnerships`, this table has no policies on purpose: everything
-- goes through the functions below, which return each side only its own.

-- 1. The table ---------------------------------------------------------

create table if not exists partnership_links (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  school_id   uuid not null references schools (id) on delete cascade,
  -- The school's offline placement company that would become the platform one.
  company_id  uuid not null references companies (id) on delete cascade,
  employer_id uuid not null references employers (id) on delete cascade,
  status      text not null default 'requested'
                check (status in ('requested', 'accepted', 'declined')),
  decided_by  uuid references auth.users (id),
  decided_at  timestamptz
);

-- One live link per offline company.
create unique index if not exists partnership_links_live_idx
  on partnership_links (company_id) where status in ('requested', 'accepted');
create index if not exists partnership_links_school_idx on partnership_links (school_id);
create index if not exists partnership_links_employer_idx on partnership_links (employer_id, status);

alter table partnership_links enable row level security;
revoke all on partnership_links from anon, authenticated;

-- 2. Verified companies a school may link to ----------------------------

create or replace function linkable_employers()
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.name
  from public.employers e
  where e.status = 'verified'
    and public.current_school_id() is not null
    and not exists (
      select 1 from public.partnerships p
      where p.school_id = public.current_school_id() and p.employer_id = e.id
    )
  order by e.name
$$;

-- 3. The coordinator proposes a link ------------------------------------

create or replace function propose_link(p_company uuid, p_employer uuid)
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
    raise exception 'Only a school coordinator can link a partner';
  end if;
  if not exists (select 1 from public.schools where id = v_school and verified) then
    raise exception 'Your school must be verified first';
  end if;

  -- Must be one of this school's OFFLINE companies.
  if not exists (
    select 1 from public.companies c
    where c.id = p_company and c.school_id = v_school and c.employer_id is null
  ) then
    raise exception 'That is not one of your offline partners';
  end if;

  if not exists (select 1 from public.employers where id = p_employer and status = 'verified') then
    raise exception 'That company is not verified';
  end if;

  if exists (
    select 1 from public.partnerships
    where school_id = v_school and employer_id = p_employer
  ) then
    raise exception 'There is already a partnership or request with that company';
  end if;

  insert into public.partnership_links (school_id, company_id, employer_id)
  values (v_school, p_company, p_employer)
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception 'That partner already has a link request';
end;
$$;

-- 4. Only the proposed COMPANY can answer -------------------------------

create or replace function respond_to_link(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  l record;
begin
  select * into l from public.partnership_links where id = p_id for update;
  if not found then
    raise exception 'Unknown link request';
  end if;
  if l.status <> 'requested' then
    raise exception 'This request has already been answered';
  end if;
  if l.employer_id is distinct from public.current_employer_id() then
    raise exception 'Only the company that was asked can answer it';
  end if;

  if not p_accept then
    update public.partnership_links
       set status = 'declined', decided_by = auth.uid(), decided_at = now()
     where id = p_id;
    return;
  end if;

  if not exists (select 1 from public.employers where id = l.employer_id and status = 'verified') then
    raise exception 'The company is not verified';
  end if;
  if not exists (select 1 from public.schools where id = l.school_id and verified) then
    raise exception 'The school is not verified';
  end if;
  -- Re-check: a partnership may have started since the proposal.
  if exists (
    select 1 from public.partnerships
    where school_id = l.school_id and employer_id = l.employer_id
  ) then
    raise exception 'There is already a partnership or request with that school';
  end if;

  -- The same company row now belongs to the platform company...
  update public.companies set employer_id = l.employer_id where id = l.company_id;

  -- ...and its offline partnership becomes a platform partnership.
  update public.partnerships
     set employer_id = l.employer_id,
         offline = false,
         requested_by = 'school',
         decided_by = auth.uid(),
         decided_at = now()
   where company_id = l.company_id and offline;

  update public.partnership_links
     set status = 'accepted', decided_by = auth.uid(), decided_at = now()
   where id = p_id;
end;
$$;

-- 5. What each side may see ---------------------------------------------

create or replace function school_links()
returns table (
  id            uuid,
  company_id    uuid,
  company_name  text,
  employer_name text,
  status        text,
  created_at    timestamptz,
  decided_at    timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.company_id, c.name, e.name, l.status, l.created_at, l.decided_at
  from public.partnership_links l
  join public.companies c on c.id = l.company_id
  join public.employers e on e.id = l.employer_id
  where l.school_id = public.current_school_id()
  order by (l.status = 'requested') desc, l.created_at desc
$$;

create or replace function employer_link_requests()
returns table (
  id           uuid,
  school_name  text,
  company_name text,
  status       text,
  created_at   timestamptz,
  decided_at   timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, s.name, c.name, l.status, l.created_at, l.decided_at
  from public.partnership_links l
  join public.schools s on s.id = l.school_id
  join public.companies c on c.id = l.company_id
  where l.employer_id = public.current_employer_id()
  order by (l.status = 'requested') desc, l.created_at desc
$$;

-- 6. Who may call what ---------------------------------------------------

revoke all on function linkable_employers() from public, anon;
revoke all on function propose_link(uuid, uuid) from public, anon;
revoke all on function respond_to_link(uuid, boolean) from public, anon;
revoke all on function school_links() from public, anon;
revoke all on function employer_link_requests() from public, anon;
grant execute on function linkable_employers() to authenticated;
grant execute on function propose_link(uuid, uuid) to authenticated;
grant execute on function respond_to_link(uuid, boolean) to authenticated;
grant execute on function school_links() to authenticated;
grant execute on function employer_link_requests() to authenticated;
