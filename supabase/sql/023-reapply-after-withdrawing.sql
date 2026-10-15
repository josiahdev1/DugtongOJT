-- 023 — a student can apply again after withdrawing (ticket 25)
--
-- Run: npx supabase db query --linked -f supabase/sql/023-reapply-after-withdrawing.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 022.
--
-- 021 allowed one application per student per listing, ever. That also
-- stopped a student from applying again after they withdrew. Now only ONE
-- LIVE application (waiting, accepted or declined) per student per listing
-- is allowed; a withdrawn one does not count.

alter table applications
  drop constraint if exists applications_listing_id_student_id_key;

create unique index if not exists applications_live_idx
  on applications (listing_id, student_id)
  where status <> 'withdrawn';
