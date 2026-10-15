-- 019 — the signed MOA document itself (ticket 21)
--
-- Run: npx supabase db query --linked -f supabase/sql/019-moa-documents.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 018.
--
-- Team decision: ONLY the school's coordinator can see the file. The
-- supervisors at the company, students and other schools cannot. A new
-- upload does not replace the old one: every upload is kept, and the page
-- shows the latest first. Same rules as the company verification documents
-- (private bucket, PDF, JPEG or PNG, up to 5 MB, opened with a link that
-- works for 60 seconds).

-- 1. Which file belongs to which company ---------------------------------

create table if not exists moa_documents (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  school_id    uuid not null default current_school_id()
                 references schools (id) on delete cascade,
  company_id   uuid not null references companies (id) on delete cascade,
  uploaded_by  uuid not null default auth.uid() references auth.users (id),
  -- Where the file lives in the private bucket. Always starts with the
  -- school's id, then the company's id: the storage rules below check the
  -- first part.
  storage_path text not null unique,
  file_name    text not null check (char_length(file_name) between 1 and 200),
  check (storage_path like school_id::text || '/' || company_id::text || '/%')
);

create index if not exists moa_documents_company_idx on moa_documents (company_id, created_at desc);

alter table moa_documents enable row level security;

create policy "coordinators read own moa documents"
  on moa_documents for select to authenticated
  using (school_id = (select current_school_id()));

-- The company must be one of the coordinator's own.
create policy "coordinators add own moa documents"
  on moa_documents for insert to authenticated
  with check (
    school_id = (select current_school_id())
    and company_id in (
      select id from companies where school_id = (select current_school_id())
    )
  );

-- Deliberately NO update or delete policy: an uploaded MOA stays on record.

revoke all on moa_documents from anon;
revoke update, delete, truncate, references, trigger on moa_documents from authenticated;

-- 2. The private bucket ---------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moa-documents', 'moa-documents', false, 5242880,
        array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- A coordinator uploads and reads files only inside their own school's
-- folder (the first part of the path is the school's id).
create policy "coordinators upload own moa files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'moa-documents'
    and (storage.foldername(name))[1] = (select public.current_school_id())::text
  );

create policy "coordinators read own moa files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'moa-documents'
    and (storage.foldername(name))[1] = (select public.current_school_id())::text
  );
