-- =====================================================================
-- DEMO DATA for Dugtong OJT  (supabase/seed/demo-data.sql)
-- =====================================================================
--
-- WHAT IT ADDS (all attached to the coordinator's existing school):
--   * 4 demo partner companies ("... (demo)") with MOA dates that are
--     expired, expiring soon, and valid (the offline partnership rows are
--     created automatically by the database trigger from 013)
--   * 1 demo supervisor email per demo company (@example.test)
--   * 14 demo roster students (student numbers DEMO-2026-001 .. 014)
--   * about 3 weeks of time entries: approved / pending / rejected
--   * a few journal entries (only on days that have hours)
--   * 5 misuse reports (submitted, escalated, upheld, not upheld)
--   * OPT-IN ONLY (v_seed_listings below, default false): 4 listings and a
--     few applications under the oldest verified employer. They are OFF by
--     default because published listings appear on the PUBLIC openings page
--     and real students could apply to them.
--
-- HEADS UP: this adds data to the LIVE school (the oldest coordinator's),
-- including one escalated and one upheld misuse report, which show up in
-- the real admin escalation queue and the dashboard counts. Run the
-- CLEANUP block at the bottom when the demo is over.
--
-- WHAT IT NEVER DOES: update, delete or overwrite any existing row,
-- and it never touches auth.users. Demo students are roster rows only:
-- nobody can log in as them (that is fine, the screens just read them).
--
-- SAFE TO RE-RUN: every insert is "ON CONFLICT DO NOTHING" or
-- "WHERE NOT EXISTS". The second run inserts nothing. It runs as one
-- block, so if anything fails, nothing is saved.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. (Read the NOTICE lines in the results for counts.)
--
-- HOW TO REMOVE: see the commented-out "CLEANUP" block at the very
-- bottom. Un-comment it, paste, Run.
--
-- DEMO MARKERS: student_no starts with 'DEMO-', emails end with
-- '@example.test', company names end with ' (demo)', listing role titles
-- end with ' (demo)'.
--
-- NOT SEEDED (and why):
--   * evaluations, certificates, report appeals, moa_documents: their
--     tables require a real auth user id (evaluated_by / issued_by /
--     appealed_by / uploaded_by are NOT NULL and filled from auth.uid(),
--     which is NULL in the SQL editor).
--   * employers, admins, coordinators: they need auth.users accounts.
--   * partnership_links: needs a real employer.
-- =====================================================================

do $$
declare
  v_school   uuid;
  v_today    date := (now() at time zone 'Asia/Manila')::date;
  v_seed_listings boolean := false;  -- true = also add demo listings/applications (public!)
  v_employer uuid;
  v_verified boolean;
  v_n        integer;
  v_ids      uuid[];
begin
  -- 1. Which school? The coordinator's (oldest coordinator), else the oldest school.
  select c.school_id into v_school
  from public.coordinators c order by c.created_at limit 1;

  if v_school is null then
    select s.id into v_school from public.schools s order by s.created_at limit 1;
  end if;

  if v_school is null then
    raise exception 'No school exists yet. Sign in as the coordinator and create the school first, then run this script again.';
  end if;

  select s.verified into v_verified from public.schools s where s.id = v_school;
  raise notice 'Seeding demo data for school % (verified: %)', v_school, v_verified;

  -- 2. Companies (the trigger from 013 adds the offline partnership) ----
  insert into public.companies (school_id, name, supervisor_name, moa_signed_on, moa_expires_on)
  select v_school, c.cname, c.sup, v_today + c.signed, v_today + c.expires
  from (values
    -- expired 35 days ago
    ('Pinnacle Digital Solutions (demo)',      'Ramon Villareal',  -400, -35),
    -- expiring in 20 days
    ('Harbor Light Hospitality Group (demo)',  'Teresa Domingo',   -345,  20),
    -- valid for about 8 more months
    ('Bayanihan Accounting Services (demo)',   'Elena Soriano',    -120, 245),
    -- valid for almost 2 more years
    ('Kapitolyo Engineering Works (demo)',     'Ricardo Salvador',  -60, 670)
  ) as c(cname, sup, signed, expires)
  where not exists (
    select 1 from public.companies x
    where x.school_id = v_school and lower(x.name) = lower(c.cname)
  );
  get diagnostics v_n = row_count;
  raise notice 'companies inserted: %', v_n;

  -- 3. One demo supervisor email per demo company -------------------
  insert into public.company_supervisors (school_id, company_id, email)
  select v_school, co.id, s.email
  from (values
    ('Pinnacle Digital Solutions (demo)',     'supervisor.pinnacle@example.test'),
    ('Harbor Light Hospitality Group (demo)', 'supervisor.harborlight@example.test'),
    ('Bayanihan Accounting Services (demo)',  'supervisor.bayanihan@example.test'),
    ('Kapitolyo Engineering Works (demo)',    'supervisor.kapitolyo@example.test')
  ) as s(cname, email)
  join public.companies co
    on co.school_id = v_school and lower(co.name) = lower(s.cname)
  on conflict do nothing;
  get diagnostics v_n = row_count;
  raise notice 'company_supervisors inserted: %', v_n;

  -- 4. Roster students (cannot log in: no auth.users rows) ----------
  insert into public.students (school_id, name, student_no, course, email, company_id, required_hours)
  select v_school, s.sname, s.sno, s.course, s.email, co.id, s.hrs
  from (values
    ('Juan Miguel Dela Cruz',   'DEMO-2026-001', 'BS Information Technology',   'juan.delacruz@example.test',      'Pinnacle Digital Solutions (demo)',     486),
    ('Maria Clara Santos',      'DEMO-2026-002', 'BS Computer Science',         'maria.santos@example.test',       'Pinnacle Digital Solutions (demo)',     486),
    ('Jose Rafael Reyes',       'DEMO-2026-003', 'BS Information Systems',      'jose.reyes@example.test',         'Pinnacle Digital Solutions (demo)',     300),
    ('Angelica Mae Bautista',   'DEMO-2026-004', 'BS Information Technology',   'angelica.bautista@example.test',  'Pinnacle Digital Solutions (demo)',     486),
    ('Katrina Joy Villanueva',  'DEMO-2026-005', 'BS Hospitality Management',   'katrina.villanueva@example.test', 'Harbor Light Hospitality Group (demo)', 300),
    ('Mark Anthony Garcia',     'DEMO-2026-006', 'BS Tourism Management',       'mark.garcia@example.test',        'Harbor Light Hospitality Group (demo)', 300),
    ('Leah Marie Ocampo',       'DEMO-2026-007', 'BS Hospitality Management',   'leah.ocampo@example.test',        'Harbor Light Hospitality Group (demo)', 240),
    ('Patrick John Mendoza',    'DEMO-2026-008', 'BS Accountancy',              'patrick.mendoza@example.test',    'Bayanihan Accounting Services (demo)',  486),
    ('Rhea Anne Castillo',      'DEMO-2026-009', 'BS Business Administration',  'rhea.castillo@example.test',      'Bayanihan Accounting Services (demo)',  300),
    ('Christian Paul Navarro',  'DEMO-2026-010', 'BS Accountancy',              'christian.navarro@example.test',  'Bayanihan Accounting Services (demo)',  486),
    ('Bianca Louise Aquino',    'DEMO-2026-011', 'BS Business Administration',  'bianca.aquino@example.test',      'Bayanihan Accounting Services (demo)',  150),
    ('Gabriel Luis Ramos',      'DEMO-2026-012', 'BS Civil Engineering',        'gabriel.ramos@example.test',      'Kapitolyo Engineering Works (demo)',    240),
    ('Sofia Isabel Mercado',    'DEMO-2026-013', 'BS Electrical Engineering',   'sofia.mercado@example.test',      'Kapitolyo Engineering Works (demo)',    240),
    ('Daniel Joseph Tolentino', 'DEMO-2026-014', 'BS Mechanical Engineering',   'daniel.tolentino@example.test',   'Kapitolyo Engineering Works (demo)',    120)
  ) as s(sname, sno, course, email, cname, hrs)
  join public.companies co
    on co.school_id = v_school and lower(co.name) = lower(s.cname)
  on conflict do nothing;
  get diagnostics v_n = row_count;
  raise notice 'students inserted: %', v_n;

  -- 5. Time entries: weekdays in the last 21 days (not today), about 70%
  --    of days worked, 08:00-09:00 start, 4 / 8 / 9 hour shifts (all end
  --    by 18:00 Manila time). Older days mostly approved, recent days
  --    mostly pending, a few rejected. Only for demo students that have
  --    no entries yet, so a re-run adds nothing.
  insert into public.time_entries
    (student_id, school_id, work_date, time_in, time_out, status, approved_at)
  select
    st.id, v_school, d.work_date,
    ((array['08:00','08:30','09:00'])[1 + (hh.h / 10) % 3])::time,
    ((array['08:00','08:30','09:00'])[1 + (hh.h / 10) % 3])::time
      + ((array[4, 8, 8, 9])[1 + (hh.h / 100) % 4] * interval '1 hour'),
    x.status,
    case when x.status = 'pending' then null
         else least(now(), ((d.work_date + 1) + time '10:00') at time zone 'Asia/Manila')
    end
  from public.students st
  cross join generate_series(1, 21) as g(n)
  cross join lateral (select v_today - g.n as work_date) d
  cross join lateral (
    select (hashtext(st.student_no || '|' || g.n::text) & 2147483647) as h
  ) hh
  cross join lateral (
    select case
             when hh.h % 13 = 0 then 'rejected'
             when g.n >= 8 then 'approved'
             when g.n >= 4 then (case when hh.h % 3 = 0 then 'pending' else 'approved' end)
             else 'pending'
           end as status
  ) x
  where st.school_id = v_school
    and st.student_no like 'DEMO-%'
    and st.email like '%@example.test'
    and extract(isodow from d.work_date) between 1 and 5
    and hh.h % 10 < 7
    and not exists (select 1 from public.time_entries t where t.student_id = st.id);
  get diagnostics v_n = row_count;
  raise notice 'time_entries inserted: %', v_n;

  -- 6. Journal entries: a few, only on days that have hours (the trigger
  --    from 022 enforces that). They are inserted as 'submitted' (the
  --    trigger forces it), then THIS RUN'S new rows only are moved to
  --    approved / rejected. Skipped for students who already have any.
  with ins as (
    insert into public.journal_entries (student_id, school_id, work_date, body)
    select t.student_id, v_school, t.work_date,
      (array[
        'Shadowed the team during the morning stand-up, then helped prepare documents and organize files for the week.',
        'Learned the office tools and processes today, and finished the small tasks my supervisor assigned to me.',
        'Assisted with data encoding and checking, then wrote down questions to ask my supervisor tomorrow.',
        'Observed how the team handles clients, and practiced writing a short summary of the day''s activities.',
        'Worked on my assigned task from start to finish and reviewed the result with my supervisor for feedback.'
      ])[1 + (hashtext(st.student_no || t.work_date::text) & 2147483647) % 5]
    from public.time_entries t
    join public.students st on st.id = t.student_id
    where st.school_id = v_school
      and st.student_no like 'DEMO-%'
      and st.email like '%@example.test'
      and t.status <> 'rejected'
      and t.work_date <= v_today - 2
      and (hashtext(st.student_no || '|j|' || t.work_date::text) & 2147483647) % 18 = 0
      and not exists (select 1 from public.journal_entries j where j.student_id = st.id)
    returning id
  )
  select coalesce(array_agg(id), '{}') into v_ids from ins;
  raise notice 'journal_entries inserted: %', coalesce(array_length(v_ids, 1), 0);

  -- Decide only the rows created just now (so a re-run changes nothing).
  -- About 1 in 4 stays 'submitted'.
  update public.journal_entries j
  set status = case when (hashtext(j.id::text) & 2147483647) % 4 in (0, 1)
                    then 'approved' else 'rejected' end,
      review_note = case when (hashtext(j.id::text) & 2147483647) % 4 = 2
                         then 'Please add more detail about what you actually did.' end,
      decided_at = now()
  where j.id = any (v_ids)
    and (hashtext(j.id::text) & 2147483647) % 4 <> 3;

  -- 7. Misuse reports (inserted directly in their final state; the
  --    database only fills in school_id and company_id). Only one is
  --    "upheld", so no company reaches the 3-upheld auto-flag.
  insert into public.reports
    (student_id, school_id, company_id, category, related_date, description,
     status, escalated_at, decided_at)
  select st.id, v_school, st.company_id, r.category, v_today - r.ago, r.descr, r.status,
         case when r.status = 'escalated' then now() - interval '1 day' end,
         case when r.status in ('upheld', 'not_upheld') then now() - interval '3 days' end
  from (values
    ('DEMO-2026-003', 'unrecorded_overtime', 6,  'submitted',
      'Stayed two hours past closing to finish a deployment but the extra time was not counted.'),
    ('DEMO-2026-007', 'unsafe_conditions',   9,  'submitted',
      'The kitchen storage area had wet floors with no warning signs and no safety gear provided.'),
    ('DEMO-2026-005', 'out_of_scope_work',   12, 'escalated',
      'Was asked to run personal errands for staff instead of doing hospitality training tasks.'),
    ('DEMO-2026-009', 'out_of_scope_work',   18, 'upheld',
      'Assigned only to photocopying and filing for the whole week with no accounting exposure.'),
    ('DEMO-2026-011', 'unrecorded_overtime', 15, 'not_upheld',
      'Believed a Saturday half day should have been logged, but no work was assigned that day.')
  ) as r(sno, category, ago, status, descr)
  join public.students st
    on st.school_id = v_school and st.student_no = r.sno and st.email like '%@example.test'
  where not exists (select 1 from public.reports x where x.student_id = st.id);
  get diagnostics v_n = row_count;
  raise notice 'reports inserted: %', v_n;

  -- 8. Listings and applications: ONLY if a verified employer exists
  --    (we never create employer accounts: they need auth users).
  select e.id into v_employer
  from public.employers e where e.status = 'verified' order by e.created_at limit 1;

  if not v_seed_listings then
    raise notice 'Listings and applications SKIPPED (v_seed_listings is false).';
  elsif v_employer is null then
    raise notice 'No verified employer exists: listings and applications SKIPPED.';
  else
    insert into public.listings
      (employer_id, course, slots, required_hours, schedule, hours_per_day,
       city, role_title, scope_of_tasks, status)
    select v_employer, l.course, l.slots, l.hrs, l.schedule, l.hpd, l.city, l.title, l.scope, l.status
    from (values
      ('Junior Web Developer Intern (demo)', 'BS Information Technology', 3, 486,
        'Monday to Friday, 8:00 AM to 5:00 PM', 8.00, 'Quezon City',
        'Build and test small features for internal web tools, fix reported bugs, and write simple documentation under a mentor.', 'published'),
      ('QA Tester Intern (demo)', 'BS Computer Science', 2, 300,
        'Monday to Thursday, 9:00 AM to 5:00 PM', 8.00, 'Makati City',
        'Run test cases on web and mobile apps, log defects clearly, and help retest fixes before each release.', 'published'),
      ('Accounting Intern (demo)', 'BS Accountancy', 2, 486,
        'Monday to Friday, 8:00 AM to 4:00 PM', 8.00, 'Pasig City',
        'Assist with bookkeeping entries, bank reconciliation, filing of receipts, and preparation of monthly summaries.', 'published'),
      ('Front Desk Intern (demo)', 'BS Hospitality Management', 1, 300,
        'Tuesday to Saturday, 10:00 AM to 6:00 PM', 8.00, 'Taguig City',
        'Greet guests, handle reservations and check-ins, and support the front office team with daily reports.', 'closed')
    ) as l(title, course, slots, hrs, schedule, hpd, city, scope, status)
    where not exists (
      select 1 from public.listings x
      where x.employer_id = v_employer and x.role_title = l.title
    );
    get diagnostics v_n = row_count;
    raise notice 'listings inserted: %', v_n;

    if coalesce(v_verified, false) is not true then
      raise notice 'School is not verified yet: applications SKIPPED (the database refuses them).';
    else
      with ins as (
        insert into public.applications (listing_id, student_id, school_id, employer_id,
                                         listing_title, company_name, note)
        select l.id, st.id, v_school, v_employer, l.role_title, 'x', a.note
        from (values
          ('DEMO-2026-001', 'Junior Web Developer Intern (demo)', 'I enjoy building web apps and would love to learn from your team.'),
          ('DEMO-2026-002', 'Junior Web Developer Intern (demo)', 'I have built two class projects with Next.js and want real experience.'),
          ('DEMO-2026-004', 'QA Tester Intern (demo)',            'I am detail oriented and enjoy finding bugs before users do.'),
          ('DEMO-2026-008', 'Accounting Intern (demo)',           'I am comfortable with spreadsheets and basic bookkeeping.')
        ) as a(sno, title, note)
        join public.students st
          on st.school_id = v_school and st.student_no = a.sno and st.email like '%@example.test'
        join public.listings l
          on l.employer_id = v_employer and l.role_title = a.title and l.status = 'published'
        where not exists (select 1 from public.applications x where x.student_id = st.id)
        returning id
      )
      select coalesce(array_agg(id), '{}') into v_ids from ins;
      raise notice 'applications inserted: %', coalesce(array_length(v_ids, 1), 0);

      -- This run's rows only: one accepted, one declined, the rest stay 'sent'.
      update public.applications a
      set status = 'accepted', decided_at = now()
      from public.students st
      where a.id = any (v_ids) and st.id = a.student_id and st.student_no = 'DEMO-2026-002';

      update public.applications a
      set status = 'declined', decided_at = now()
      from public.students st
      where a.id = any (v_ids) and st.id = a.student_id and st.student_no = 'DEMO-2026-004';
    end if;
  end if;

  raise notice 'Done. Demo data is in place.';
end
$$;


-- =====================================================================
-- CLEANUP  (commented out on purpose)
-- To remove ALL demo data: select everything below, remove the leading
-- "-- " from each line, paste into the SQL Editor and Run.
-- It deletes only rows carrying the demo markers, children first.
-- NOTE: applications that real students made to demo listings would be
-- deleted too (they cascade).
-- =====================================================================
-- begin;
--
-- delete from public.applications
--  where student_id in (select id from public.students where student_no like 'DEMO-%' and email like '%@example.test')
--     or listing_id  in (select id from public.listings where role_title like '% (demo)');
--
-- delete from public.listings
--  where role_title like '% (demo)'
--    and employer_id = (select e.id from public.employers e where e.status = 'verified' order by e.created_at limit 1);
--
-- delete from public.reports
--  where student_id in (select id from public.students where student_no like 'DEMO-%' and email like '%@example.test');
--
-- delete from public.journal_entries
--  where student_id in (select id from public.students where student_no like 'DEMO-%' and email like '%@example.test');
--
-- delete from public.time_entry_changes
--  where entry_id in (select t.id from public.time_entries t
--                     join public.students s on s.id = t.student_id
--                     where s.student_no like 'DEMO-%' and s.email like '%@example.test');
--
-- delete from public.time_entries
--  where student_id in (select id from public.students where student_no like 'DEMO-%' and email like '%@example.test');
--
-- delete from public.students
--  where student_no like 'DEMO-%' and email like '%@example.test';
--
-- delete from public.company_supervisors
--  where email like '%@example.test'
--    and company_id in (select id from public.companies where name like '% (demo)');
--
-- -- partnerships first: deleting a company would only blank their company_id
-- delete from public.partnerships
--  where company_id in (select id from public.companies where name like '% (demo)'
--    and school_id = (select c.school_id from public.coordinators c order by c.created_at limit 1));
--
-- delete from public.companies
--  where name like '% (demo)'
--    and school_id = (select c.school_id from public.coordinators c order by c.created_at limit 1);
--
-- commit;
