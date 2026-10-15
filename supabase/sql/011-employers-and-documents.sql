-- 011 — company accounts, verification documents, admin verification (ticket 13)
--
-- Run: npx supabase db query --linked -f supabase/sql/011-employers-and-documents.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 010.
--
-- Team decisions:
--   * Admins live in the `admins` table (008); users cannot add themselves.
--   * A company must upload (1) its DTI or SEC registration and (2) a
--     mayor's or business permit, and must TYPE the name and position of an
--     authorized representative. No ID upload.
--   * Documents go in a PRIVATE storage bucket, opened only through
--     short-lived links, by the company itself and by Dugtong admins.
--   * The document list is still to be confirmed against CHED and the pilot
--     school's requirements.
--   * An unverified company can do nothing public: it cannot post listings
--     (ticket 14).
--
-- To keep this separate from the school-side `companies` table (the
-- partner companies a coordinator types in), the new accounts are called
-- EMPLOYERS here.

-- 1. Employers ---------------------------------------------------------

create table if not exists employers (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  owner_id                uuid not null unique references auth.users (id) on delete cascade,
  name                    text not null check (char_length(trim(name)) between 1 and 120),
  representative_name     text not null check (char_length(trim(representative_name)) between 1 and 120),
  representative_position text not null check (char_length(trim(representative_position)) between 1 and 120),
  status                  text not null default 'pending'
                            check (status in ('pending', 'verified', 'rejected')),
  decided_by              uuid references auth.users (id),
  decided_at              timestamptz
);

alter table employers enable row level security;

-- The owner reads their own employer. There is no insert, update or delete
-- policy: an employer is created only by create_employer() below, and its
-- status is changed only by an admin through admin_set_employer_status().
create policy "owners read own employer"
  on employers for select to authenticated
  using (owner_id = (select auth.uid()));

revoke all on employers from anon;
revoke insert, update, delete, truncate, references, trigger on employers from authenticated;

-- 2. Helpers -------------------------------------------------------------

create or replace function current_employer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.employers where owner_id = auth.uid()
$$;

create or replace function is_employer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.employers where owner_id = auth.uid())
$$;

-- True when the signed-in user's employer has been verified by an admin.
create or replace function employer_is_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.employers
    where owner_id = auth.uid() and status = 'verified'
  )
$$;

create or replace function create_employer(
  p_name text,
  p_representative_name text,
  p_representative_position text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_id uuid;
begin
  if uid is null then
    raise exception 'You must be signed in to create a company account';
  end if;
  if exists (select 1 from public.employers where owner_id = uid) then
    raise exception 'You already have a company account';
  end if;

  insert into public.employers (owner_id, name, representative_name, representative_position)
  values (uid, p_name, p_representative_name, p_representative_position)
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function current_employer_id() from public, anon;
revoke all on function is_employer() from public, anon;
revoke all on function employer_is_verified() from public, anon;
revoke all on function create_employer(text, text, text) from public, anon;
grant execute on function current_employer_id() to authenticated;
grant execute on function is_employer() to authenticated;
grant execute on function employer_is_verified() to authenticated;
grant execute on function create_employer(text, text, text) to authenticated;

-- 3. Documents -----------------------------------------------------------

create table if not exists employer_documents (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  employer_id  uuid not null default current_employer_id()
                 references employers (id) on delete cascade,
  kind         text not null check (kind in ('registration', 'permit')),
  -- Where the file lives in the private bucket. Always starts with the
  -- employer's own id, which is what the storage rules below check.
  storage_path text not null unique,
  file_name    text not null check (char_length(file_name) between 1 and 200),
  check (storage_path like employer_id::text || '/%')
);

create index if not exists employer_documents_employer_idx on employer_documents (employer_id);

alter table employer_documents enable row level security;

create policy "owners read own documents"
  on employer_documents for select to authenticated
  using (employer_id = (select current_employer_id()));

create policy "owners add own documents"
  on employer_documents for insert to authenticated
  with check (employer_id = (select current_employer_id()));

create policy "admins read all documents"
  on employer_documents for select to authenticated
  using ((select is_admin()));

revoke all on employer_documents from anon;
revoke update, delete, truncate, references, trigger on employer_documents from authenticated;

-- 4. The private storage bucket ----------------------------------------
--
-- Not public: a file can only be opened with a short-lived signed link,
-- and a link can only be made by someone the rules below allow. Files are
-- limited to 5 MB and to PDF, JPEG or PNG.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employer-documents', 'employer-documents', false, 5242880,
        array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- A company uploads and reads files only inside its own folder (the first
-- part of the path is the employer's id). Admins can read every file.
create policy "employers upload own documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'employer-documents'
    and (storage.foldername(name))[1] = (select public.current_employer_id())::text
  );

create policy "employers read own documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'employer-documents'
    and (storage.foldername(name))[1] = (select public.current_employer_id())::text
  );

create policy "admins read all employer documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'employer-documents'
    and (select public.is_admin())
  );

-- 5. Admin: review companies ---------------------------------------------

create or replace function admin_list_employers()
returns table (
  id                      uuid,
  name                    text,
  representative_name     text,
  representative_position text,
  owner_email             text,
  status                  text,
  created_at              timestamptz,
  has_registration        boolean,
  has_permit              boolean
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
  select e.id, e.name, e.representative_name, e.representative_position,
         u.email::text, e.status, e.created_at,
         exists (select 1 from public.employer_documents d where d.employer_id = e.id and d.kind = 'registration'),
         exists (select 1 from public.employer_documents d where d.employer_id = e.id and d.kind = 'permit')
  from public.employers e
  join auth.users u on u.id = e.owner_id
  order by (e.status = 'pending') desc, e.created_at;
end;
$$;

create or replace function admin_set_employer_status(employer uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if new_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Unknown status';
  end if;

  update public.employers
     set status = new_status,
         decided_by = case when new_status = 'pending' then null else auth.uid() end,
         decided_at = case when new_status = 'pending' then null else now() end
   where id = employer;

  if not found then
    raise exception 'Unknown company';
  end if;
end;
$$;

revoke all on function admin_list_employers() from public, anon;
revoke all on function admin_set_employer_status(uuid, text) from public, anon;
grant execute on function admin_list_employers() to authenticated;
grant execute on function admin_set_employer_status(uuid, text) to authenticated;
