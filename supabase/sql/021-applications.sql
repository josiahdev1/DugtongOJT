-- 021 — students apply for a listing (ticket 25)
--
-- Run: npx supabase db query --linked -f supabase/sql/021-applications.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 020.
--
-- Team decision: the COMPANY decides an application, the school's
-- COORDINATOR deploys. Accepting an application does NOT place the student:
-- placement needs a partnership between the company and the school, so the
-- coordinator still does it (with the Deploy button, below).
--
--   * A student applies to a PUBLISHED listing of a VERIFIED company, with a
--     short note. One application per student per listing, and at most 5
--     waiting at a time. The student can withdraw it while it is waiting.
--   * The company (its owner account) accepts or declines. It sees the
--     student's name, ID, course, school and note, never their email.
--   * The coordinator reads their own school's applications, and deploys a
--     student whose application was accepted, but only to the school's
--     placement company that belongs to the SAME company account, i.e. one
--     the school already has a partnership with.
--   * The database copies the listing's title and the company's name onto
--     the application, so it still reads the same if the listing closes.

-- 1. The table ---------------------------------------------------------

create table if not exists applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  listing_id    uuid not null references listings (id) on delete cascade,
  student_id    uuid not null references students (id) on delete cascade,
  school_id     uuid not null references schools (id) on delete cascade,
  employer_id   uuid not null references employers (id) on delete cascade,

  -- Copied by the database when the student applies.
  listing_title text not null,
  company_name  text not null,

  note          text not null default '' check (char_length(note) <= 1000),
  status        text not null default 'sent'
                  check (status in ('sent', 'accepted', 'declined', 'withdrawn')),
  decided_by    uuid references auth.users (id),
  decided_at    timestamptz,

  unique (listing_id, student_id)
);

create index if not exists applications_student_idx on applications (student_id);
create index if not exists applications_employer_idx on applications (employer_id, status);
create index if not exists applications_school_idx on applications (school_id);

-- 2. Guard trigger ------------------------------------------------------

create or replace function applications_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lst record;
  stu record;
  waiting integer;
begin
  if tg_op = 'INSERT' then
    select l.employer_id, coalesce(l.role_title, l.course) as title, e.name as company_name
      into lst
    from public.listings l
    join public.employers e on e.id = l.employer_id
    where l.id = new.listing_id and l.status = 'published' and e.status = 'verified';
    if not found then
      raise exception 'This opening is not open for applications';
    end if;

    select s.school_id into stu
    from public.students s
    join public.schools sc on sc.id = s.school_id and sc.verified
    where s.id = new.student_id;
    if not found then
      raise exception 'Unknown student';
    end if;

    select count(*) into waiting
    from public.applications
    where student_id = new.student_id and status = 'sent';
    if waiting >= 5 then
      raise exception 'You can have at most 5 applications waiting at a time';
    end if;

    new.school_id     := stu.school_id;
    new.employer_id   := lst.employer_id;
    new.listing_title := lst.title;
    new.company_name  := lst.company_name;
    new.status        := 'sent';
    new.decided_by    := null;
    new.decided_at    := null;
    new.created_at    := now();
    return new;
  end if;

  -- UPDATE
  if auth.uid() is null then
    return new;   -- trusted maintenance task
  end if;

  if (new.listing_id, new.student_id, new.school_id, new.employer_id,
      new.listing_title, new.company_name, new.note, new.created_at)
     is distinct from
     (old.listing_id, old.student_id, old.school_id, old.employer_id,
      old.listing_title, old.company_name, old.note, old.created_at) then
    raise exception 'Only the status of an application can change';
  end if;

  if old.status <> 'sent' then
    raise exception 'This application has already been answered';
  end if;

  if old.student_id in (select public.current_student_ids()) then
    -- The student can only withdraw.
    if new.status <> 'withdrawn' then
      raise exception 'A student can only withdraw an application';
    end if;
    new.decided_by := old.decided_by;
    new.decided_at := old.decided_at;
  elsif old.employer_id is not distinct from public.current_employer_id() then
    -- The company accepts or declines.
    if new.status not in ('accepted', 'declined') then
      raise exception 'A company can only accept or decline an application';
    end if;
    new.decided_by := auth.uid();
    new.decided_at := now();
  else
    raise exception 'You cannot change this application';
  end if;

  return new;
end;
$$;

drop trigger if exists applications_guard_write on applications;
create trigger applications_guard_write
  before insert or update on applications
  for each row execute function applications_guard();

revoke execute on function applications_guard() from public, anon, authenticated;

-- 3. Row Level Security -------------------------------------------------

alter table applications enable row level security;

create policy "students read own applications"
  on applications for select to authenticated
  using (student_id in (select current_student_ids()));

create policy "students apply"
  on applications for insert to authenticated
  with check (student_id in (select current_student_ids()));

create policy "students withdraw own applications"
  on applications for update to authenticated
  using (student_id in (select current_student_ids()) and status = 'sent')
  with check (student_id in (select current_student_ids()));

create policy "coordinators read own school applications"
  on applications for select to authenticated
  using (school_id = (select current_school_id()));

-- A company reads and answers through the functions below.

revoke all on applications from anon;
revoke delete, truncate, references, trigger on applications from authenticated;

-- 4. The company's side ---------------------------------------------------

create or replace function employer_applications()
returns table (
  id            uuid,
  listing_id    uuid,
  listing_title text,
  student_name  text,
  student_no    text,
  course        text,
  school_name   text,
  note          text,
  status        text,
  created_at    timestamptz,
  decided_at    timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.listing_id, a.listing_title, s.name, s.student_no, s.course,
         sc.name, a.note, a.status, a.created_at, a.decided_at
  from public.applications a
  join public.students s on s.id = a.student_id
  join public.schools sc on sc.id = a.school_id
  where a.employer_id = public.current_employer_id()
    and a.status <> 'withdrawn'
  order by (a.status = 'sent') desc, a.created_at desc
$$;

create or replace function respond_to_application(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_employer_id() is null then
    raise exception 'Only a company account can answer an application';
  end if;

  update public.applications
     set status = case when p_accept then 'accepted' else 'declined' end
   where id = p_id
     and employer_id = public.current_employer_id()
     and status = 'sent';

  if not found then
    raise exception 'That application is not waiting for your answer';
  end if;
end;
$$;

-- 5. The coordinator deploys ----------------------------------------------
--
-- Moves the student to the school's placement company that belongs to the
-- company that accepted them. The students rule from 013 still applies: the
-- target must have an accepted partnership.

create or replace function deploy_student(p_application uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school uuid := public.current_school_id();
  app record;
  target uuid;
begin
  if v_school is null then
    raise exception 'Only a school coordinator can deploy a student';
  end if;

  select * into app from public.applications
  where id = p_application and school_id = v_school;
  if not found then
    raise exception 'Unknown application';
  end if;
  if app.status <> 'accepted' then
    raise exception 'Only an accepted application can be deployed';
  end if;

  select c.id into target
  from public.companies c
  where c.school_id = v_school and c.employer_id = app.employer_id;
  if target is null then
    raise exception 'Partner with this company first';
  end if;

  update public.students set company_id = target where id = app.student_id;
end;
$$;

revoke all on function employer_applications() from public, anon;
revoke all on function respond_to_application(uuid, boolean) from public, anon;
revoke all on function deploy_student(uuid) from public, anon;
grant execute on function employer_applications() to authenticated;
grant execute on function respond_to_application(uuid, boolean) to authenticated;
grant execute on function deploy_student(uuid) to authenticated;
