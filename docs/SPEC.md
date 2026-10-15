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

## Out of scope
- Marketplace connecting schools to companies, and company OJT listings
- Company verification and partnership requests
- Escalating a misuse report to a Dugtong admin, and a company's right to appeal an upheld report
- Storing the signed MOA document itself (only its dates are tracked)
- Evaluation rating and the school's evaluation form
- Onboarding more than one school
- Server-side PDF generation (the report is printed to PDF from the
  browser)

Deliberate cuts from the proposal: there is no evaluation rating. (The
MVP had the coordinator approving hours; supervisor approval was added
afterwards, see "Added after the MVP".)
