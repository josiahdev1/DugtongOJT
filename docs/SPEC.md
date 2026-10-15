# Spec: Dugtong

## Problem
An OJT (on-the-job training) coordinator must know how many hours each
of hundreds of students has done, and must produce each student's final
hours summary. Today this lives on paper and spreadsheets and is typed
in and added up by hand. (Proposal's claim; to be confirmed with a real
coordinator, see `docs/PROBLEM.md`.)

## Solution
The coordinator uploads a student roster. Students log their own daily
time-in and time-out. The coordinator approves or rejects each entry,
and the student's approved-hours total updates. One click opens a
printable hours report for a student, which the coordinator saves as PDF.

## The user
One OJT coordinator at one school. Students are helper users who only
log and see their own hours.

## User stories
1. As a coordinator, I want to name my school and sign in, so that my
   students and records are mine alone.
2. As a coordinator, I want to add a partner company, so that I can
   assign students to it.
3. As a coordinator, I want to upload a CSV roster and preview it before
   confirming, so that I don't type in hundreds of students by hand.
4. As a student, I want to log my time-in and time-out for a day, so
   that my hours are recorded without paper.
5. As a coordinator, I want to approve or reject each time entry, so
   that only checked hours count.
6. As a coordinator, I want a dashboard of every student's approved
   hours against required hours, so that I see who is behind.
7. As a coordinator, I want to generate a student's hours report with
   one click, so that I don't build it from scratch.
8. As a student, I want to see my own entries, their status and my
   approved total, so that I know where I stand.

## Screens
1. **Sign in** — email and password for everyone. After sign-in,
   coordinators go to the Dashboard, students go to My hours. An email
   that is neither a coordinator nor on a roster sees a "you are not on
   a roster" message. That screen also has a "Set up my school" link, so
   a new coordinator can reach screen 2, and a note that their school may
   still be waiting to be verified.
2. **Set up school** (coordinator, first time only) — name the school
   once.
3. **Dashboard** (coordinator) — table of students with company,
   approved / required hours and pending entries; a pending-approvals
   count; buttons for Upload roster and Add company; a "waiting for
   verification" notice until the team verifies the school.
4. **Add company** (coordinator) — form for company name and supervisor
   name.
5. **Upload roster** (coordinator) — upload a CSV (name, student ID,
   course, email, company, required hours), preview rows, confirm. At
   most 500 students and 1 MB per file. If any row is bad, nothing is
   imported, and a table lists each problem by row number and column.
6. **Student detail** (coordinator) — that student's time entries with
   Approve and Reject buttons (a decision can be changed later), a change
   history, and a Generate report button.
7. **My hours** (student) — form for date, time-in and time-out; list of
   own entries with status; total of approved hours. The date is today or
   up to 30 days back (Philippine time), one entry per day. A rejected
   day can be logged again to fix and resubmit it.
8. **Hours report** — printable page for one student: student, company,
   daily approved entries, approved hours and progress toward required
   hours. The coordinator uses the browser's Save as PDF.

## Data
All tables have Row Level Security (RLS) on. Every record belongs to a
school, so a second school can be added later without redoing the rules.

- **schools**: name, verified. A coordinator reads their own school and
  may rename it, but can never change `verified`; only the team can, in
  SQL. Any signed-in user may create a school, which then becomes theirs
  (through a database function, so they cannot attach themselves to
  someone else's). A school's roster only works for students once the
  school is verified. This stops a stranger from creating a school and
  claiming a classmate's email.
- **coordinators**: user, school. A user reads their own row. A user may
  create a row linking themselves to the school they just created, and
  no other.
- **companies**: school, company name, supervisor name. Only that
  school's coordinator reads and writes.
- **students** (the roster): school, name, student ID, course, email
  (stored lowercase), company, required hours. The coordinator reads and
  writes their school's rows. A student reads only their own row,
  matched by the verified email of the signed-in session (compared in
  lowercase), never an email sent by the browser, and only in a verified
  school. Students cannot write. If the same email is on two rosters, the
  oldest roster row is always the one used.
- **time_entries**: student, school (filled in by the database), work
  date, time-in, time-out, status (pending, approved or rejected),
  approved by, approved at. A student reads and inserts only their own
  entries, always as pending. A student may edit an entry while it is
  pending, or fix a rejected one, which sends it back to pending. Once
  approved, a student cannot edit it. Only that school's coordinator may
  approve or reject, and may change a decision later. A coordinator
  cannot change the date or times, or send an entry back to pending. The
  database stamps "approved by" and "approved at"; the browser cannot.
- **time_entry_changes** (audit log): entry, school, changed by, changed
  at, old values, new values. Filled automatically by the database for
  every decision and every change after one. The coordinator reads their
  school's rows. Nobody writes to it directly.
- **student_hours** (a view, not a table): each student's approved hours
  and pending count, added up by the database and limited by the same
  Row Level Security as the tables it reads. The Dashboard and the report
  use it.

Students are added only through the coordinator's roster upload. An
email that is not on a roster sees and logs nothing.

## Login
Yes. Supabase Auth, email and password, with **email confirmation
turned on** so a student must prove they own the email before it can
match a roster row. Anyone can create an empty account, but without a
coordinator or roster match it can see nothing. The service-role key is
never used: accounts are never created from the roster upload.

## Done for the demo
On the LIVE Vercel URL:
- [ ] A coordinator can sign up, confirm email, sign in and name a school.
- [ ] An admin has verified the demo school on the Admin screen (see the
      README), or the students cannot sign in.
- [ ] The coordinator adds one partner company.
- [ ] The coordinator uploads a CSV of 5 fake students and sees them on
      the Dashboard, assigned to the company.
- [ ] A rostered student signs in, logs one day's time-in and time-out
      and sees it as pending.
- [ ] The coordinator approves it, and the student's approved total
      updates on both screens.
- [ ] The coordinator opens the hours report and saves it as PDF.
- [ ] A student cannot see another student's data, and an email not on
      a roster sees nothing.
- [ ] All demo students are clearly labelled sample data (the sample CSV
      names them "Sample Student N"; the app does not enforce this).
- [ ] RLS is on for every table, and no secret key is in the project.

## Added after the MVP
Built from the LATER list once the MVP worked. The three-minute demo does
not need either of these.

- **Completion certificate** (ticket 08). On a student's page, once their
  approved hours reach their required hours, the coordinator can issue a
  certificate. New table **certificates**: student, school, issued by,
  hours completed, required hours, issued at. The database adds up the
  approved hours itself and refuses to create a certificate below the
  requirement, sets who issued it and when, and allows one per student.
  Only that school's coordinator can read or issue one. An issued
  certificate cannot be edited or deleted, and it is not changed if an
  approval is revoked later. The certificate page shows only these stored
  values and prints to PDF like the hours report.
- **MOA dates** (ticket 09). Each company has an optional "MOA signed" and
  "MOA expires" date (new columns on **companies**; the expiry must be
  after the signing date). The Companies page shows each MOA as no dates,
  valid, expiring in N days (within 30 days) or expired, and the
  Dashboard warns when any MOA needs attention. The coordinator can add or
  change the dates at any time. Same access as the rest of **companies**.

- **Admins and school verification** (ticket 16). The team's members are
  listed in an `admins` table (edited in SQL; nobody can read or change it
  through the app). An admin signs in to an **Admin** screen that lists
  every school with its coordinator's email, student and company counts,
  and a Verify / Remove verification button. The database functions behind
  it check for an admin themselves, so no one else can use them.

- **Supervisor approval** (ticket 10; team decision: the supervisor
  approves, the coordinator can override). On a company's row on the
  Companies page, the coordinator adds supervisors by email (new table
  **company_supervisors**: school, company, email in lowercase; only that
  school's coordinator reads, adds and removes). A supervisor signs up
  with that email, confirms it, and is matched by the verified email of
  their login, only in a verified school. They land on a **Supervisor**
  screen with the entries waiting for approval and their students' hours.
  A supervisor sees only the time entries of students at their own
  company; they never read the students table (so never see emails) and
  get name, ID, course, hours and company through a database function.
  They can approve or reject, never change dates or times, never send an
  entry back to pending, and cannot approve their own hours if they are
  also a student. The database stamps who decided and when. A coordinator
  can still change any decision. The change history now records whether
  a coordinator, supervisor or student made each change.

- **Misuse reports** (ticket 11; team decisions). New table **reports**:
  student, school and company (both filled in by the database from the
  roster), type (work outside the agreed tasks, unsafe conditions, or
  unrecorded overtime), the day it happened (today or up to 90 days
  back), a description of 10 to 2000 characters, status, who decided and
  when. Statuses: `submitted`, `upheld`, `not_upheld`, and no others. A
  student files from a "Report a problem" page linked on My hours and sees
  only their own reports. The school coordinator sees every report for
  their school, including who filed it, and is the only one who can move
  it from submitted to upheld or not upheld. The decision is final; there
  is no escalation to an admin. A supervisor sees a report only after it
  is upheld, only for their own company, through a database function that
  never returns the student. A report that is not upheld is never shown to
  the company.

- **Company accounts and verification** (ticket 13; team decisions). A
  user can set up a company account from the "not on a roster" screen. New
  table **employers** (named "employers" to keep them apart from the
  school-side **companies** a coordinator types in): owner, name, the
  authorized representative's name and position, and a status of
  `pending`, `verified` or `rejected`, starting at pending. Only the owner
  can read their row, and a company account is created through a database
  function. The status is changed only by an admin through a database
  function. New table **employer_documents**: which file is the company's
  DTI or SEC registration (`registration`) or mayor's or business permit
  (`permit`). No ID is collected. The files live in a private storage
  bucket, `employer-documents`: PDF, JPEG or PNG, up to 5 MB, each company
  able to write and read only inside a folder named after itself. Nothing
  is ever public. A document opens only through a link that lasts 60
  seconds, made for the owning company or an admin. The Admin screen lists
  companies, waiting ones first, with the owner's email, the
  representative and both documents, and lets an admin verify, reject or
  send a company back to waiting. The document list is still to be
  confirmed against CHED and the pilot school's requirements.

- **Company listings** (ticket 14; team decisions). A verified company
  posts OJT openings from its Company screen. New table **listings**:
  company, course, slots, required hours, schedule, hours per day, city or
  municipality, an optional role title, scope of tasks, and a status of
  `draft`, `published` or `closed`. The course comes from a fixed list in
  a **courses** table (a starter list of 14 common programs, still to be
  confirmed with the pilot school, changed in SQL). A listing cannot leave
  draft without a scope of tasks (at least 20 characters), only a verified
  company can publish, and a published listing cannot go back to draft.
  A company reads and edits only its own listings. Visitors never touch
  the listings table. A public page at `/listings`, open without signing
  in, reads a view that shows only published listings of verified
  companies, and only the agreed public fields: company name, a verified
  label, course, slots, required hours, schedule and hours per day, scope
  of tasks, city, and the optional role title. Contact details, documents,
  internal notes, students and trust scores are never public. Visitors can
  filter by course and by "at least this many required hours". A listing
  leaves the page when it is closed or its company stops being verified.
  A company can now edit a listing after it is posted (ticket 24).

- **Partnerships** (ticket 15; team decisions). New table
  **partnerships**: the school, the company (empty for an offline partner),
  whether it is offline, who started it (school or company), a status of
  `requested`, `accepted` or `declined` and no others, and the school's
  placement company it produced. It cannot be read or changed directly;
  each side uses database functions that show it only its own. A company
  the coordinator types in is an **offline partner**: a partnership created
  directly as accepted, marked offline, with no company account, based on a
  signed MOA the school already holds (every company that existed before
  this feature was backfilled the same way). A **platform partnership**
  starts when either a coordinator at a verified school asks a verified
  company (from the public openings page) or a verified company asks a
  verified school (from its Company screen). Only the side that received
  the request can accept or decline it, so a sender can never answer their
  own request; an answered request is final and a pair cannot ask twice.
  Accepting creates the school's placement company for that partner (with
  "(platform)" added to the name if the coordinator already typed in a
  company with the same name). Every company in `companies` now has an
  accepted partnership behind it, and the database refuses to assign a
  student to a company without one. A coordinator can no longer set a
  company's link to a platform company or edit anything on a company but
  its MOA dates. Coordinators have a **Partnerships** page (requests from
  companies, requests they sent, platform partners, offline partners).
  Linking an offline partner to the same company when it later joins the
  platform is not built.

- **Evaluations** (ticket 12; team decision). The student's **supervisor**
  fills in the school's own form (`templates/OJT-Evaluation-SY2526-Google-Forms.pdf`):
  department, supervisor name and position, ten criteria in three groups
  rated 1 to 5 (the criteria and scale are copied word for word into
  `src/lib/evaluation.ts`), strong points, areas for improvement, and
  comments. New table **evaluations**, one per student. The supervisor can
  come back and edit it; the coordinator can only read it; students cannot
  read it. The database copies the student's name, ID, course and company
  onto the row and records who saved it and when. The evaluation opens as a
  printable page that the browser saves as PDF, like the hours report.

- **Escalation** (ticket 17; team decisions). A coordinator can escalate a
  misuse report that is still waiting for their decision to a Dugtong
  admin. It then has a fourth status, `escalated`. Only an admin can decide
  it (upheld or not upheld, final); the coordinator can no longer change it.
  Admins see the report, the school and the company, never the student. A
  company's `review_state` is `none`, `flagged` or `under_review`. The
  database flags a company by itself when it has 3 upheld reports; an admin
  then marks it under review or restores it, and after a restore only later
  upheld reports count. "Under review" is shown to admins and to the
  coordinator, and does not block placements. Admins work on the new
  **Reports** tab of the Admin screen.

- **Appeals** (ticket 19; team decisions). The supervisor at a company can
  appeal a report that was upheld about their company, once per report,
  with a written reason. New table **report_appeals**, which keeps its own
  copy of the report's category, date and text (never the student). Only a
  Dugtong admin decides an appeal, and the decision is final: granted turns
  the report into "not upheld" (the supervisor stops seeing it); denied
  changes nothing. The coordinator sees that a report was appealed and the
  outcome. Admins decide appeals on the **Reports** tab of the Admin screen
  and never see the student. A granted appeal does not restore a flagged
  company by itself.

- **Linking an offline partner** (ticket 20; team decisions). A coordinator
  can propose linking one of their offline partners to the same company
  when it joins the platform; the company must accept, and nothing changes
  until it does. New table **partnership_links**, readable only through
  database functions. Accepting gives the existing company row the
  company's account and turns its offline partnership into a platform one,
  so students, hours, reports, evaluations, MOA dates and supervisors stay
  where they are. Only a verified company with no partnership or request
  with the school can be linked, and an offline partner has one live link
  request at a time (a declined one can be sent again). Merging with a
  company the school already partners with on the platform is not built.

- **Journal** (ticket 18; team decisions). New table **journal_entries**: one
  entry per day a student logged hours, text only (20 to 2000 characters).
  The coordinator approves or rejects it (a rejection needs a note); the
  supervisor can read but never approves. It is separate from hours. A student
  edits an entry until it is approved; editing a rejected one sends it again.
  The database refuses an entry for a day with no logged hours.
- **MOA document** (ticket 21). A coordinator uploads the signed MOA for a
  company (private bucket, PDF, JPEG or PNG, up to 5 MB). Only that school's
  coordinator can open it. Every upload is kept; the newest is "latest".
- **Student certificate** (ticket 22). A student opens their own certificate
  from My hours and saves it as a PDF, through a database function that
  returns only their own.
- **Dashboard paging** (ticket 23). The student list shows 25 at a time, and
  the Dashboard fetches every student 1000 at a time so nobody is cut off.
- **Applications** (ticket 25; team decisions). A student applies for a
  published opening of a verified company with a short note (at most 5 waiting;
  can withdraw and re-apply). The company accepts or declines and sees the
  student's name, ID, course, school and note, never their email. Accepting
  does not place the student: the coordinator deploys them, only to the
  school's placement company belonging to the same company account (so a
  partnership must already exist).

## Out of scope
- Matching students to listings automatically (students apply, companies decide, coordinators deploy)
- Onboarding more than one school
- Server-side PDF generation (the report is printed to PDF from the
  browser)

Deliberate cuts from the proposal: there was no evaluation rating in the
MVP; it was added afterwards (see "Added after the MVP"). (The
MVP had the coordinator approving hours; supervisor approval was added
afterwards, see "Added after the MVP".)
