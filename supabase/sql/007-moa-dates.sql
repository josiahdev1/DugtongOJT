-- 007 — MOA dates on companies (ticket 09)
--
-- Run: npx supabase db query --linked -f supabase/sql/007-moa-dates.sql
-- (or paste into the Supabase SQL Editor). Run it ONCE, after 006.
--
-- A MOA is the signed agreement between the school and a partner company.
-- We only record WHEN it was signed and WHEN it expires, so the school is
-- warned before it lapses. (Storing the signed document itself is a later
-- feature.) Both dates are optional, because the coordinator may not know
-- them for every company yet.
--
-- No new policy is needed: the companies policies from 002 already say
-- only the school's own coordinator reads and edits its companies, and
-- that covers the new columns too.

alter table companies
  add column if not exists moa_signed_on  date,
  add column if not exists moa_expires_on date;

-- A MOA cannot expire on or before the day it was signed.
alter table companies
  add constraint companies_moa_dates_check
  check (
    moa_signed_on is null
    or moa_expires_on is null
    or moa_expires_on > moa_signed_on
  );
