# Dugtong OJT: demo script

One internship, start to finish, told through the people who touch it. About 15 minutes: Part A (8 min) works with the data that exists today. Part B (7 min) needs two company accounts created beforehand.

**The story in one line:** a school places students with partner companies, the students log hours and write journals, supervisors approve and evaluate, and the platform protects students and holds companies accountable.

## Starting from an empty database

If the database was reset, there are no logins and no school. Create them in this order:
1. Sign up the coordinator's email (confirm it from the email), then **Set up my school**.
2. Make an admin: in the Supabase SQL Editor run
   `insert into admins (user_id) select id from auth.users where email = 'admin@example.com';`
   then sign in as the admin and **verify the school** on the Admin screen.
3. As the coordinator, add a company and upload a roster (students' emails must match the logins they will sign up with), then add the supervisor's email on the Companies page.
4. Sign up the student and supervisor emails.

## Before you start (do this once, 10 minutes)

1. Run the app: `npm run dev`, then open http://localhost:3000. Do a full dry run before the real demo: the coordinator, student, company and admin screens were built and tested in the database, but not clicked through end to end.
2. Open **five separate browser windows** (use a different browser or private windows so the logins don't clash):

| Window | Who | Login |
|---|---|---|
| 1 | Coordinator, your school | coordinator@example.com |
| 2 | A student on the roster (the email must match the roster) | student@example.com |
| 3 | Supervisor (added to a company by the coordinator, matched by email) | supervisor@example.com |
| 4 | Dugtong admin (added with the SQL from the setup notes) | admin@example.com |
| 5 | A company (created in the next step) | your choice |

   Use your own emails and passwords. The database was reset to zero data, so sign up each account first (see "Starting from an empty database" below).
3. **For Part B, create the companies in advance:**
   - Sign up two company accounts. For each: Company page, upload the two documents, then in window 4 go to Admin, **Companies** tab, and **verify** it. Call them **Company A** (will be linked to Sample Company) and **Company B** (will take applications).
   - In **Company B**, post and publish one opening (any course, scope of tasks of 20+ characters).
4. **For the certificate scene (step 5):** a certificate can only be issued once approved hours reach the required hours. Before the demo, lower one student's required hours in the Supabase SQL Editor, for example:
   `update students set required_hours = 8 where name = 'Your Student';`
   Afterwards put it back to its real value.
5. Reset between runs: the demo adds data (evaluations, appeals, applications, journal entries). Delete test rows in Supabase, or use the sample students (Sample Student 1 to 5) which have no logins and are never changed by the demo.

## Part A: the core internship (8 minutes)

### 1. The coordinator's home (window 1, 1 min)
- Open **Dashboard**. Point out: the "needs you" list at the top, the totals, the activity feed.
- The student list shows **25 per page** with Previous and Next. Search "Sample" and click a tab (All, Waiting, Completed): the page goes back to page 1.
- Say: "A school with thousands of students still sees everyone. We load them in batches of 1000 because the database silently cuts a list at 1000."

### 2. The student logs hours and writes a journal (window 2, 2 min)
- **My hours:** log a day (date, time in, time out). It shows as pending.
- **My journal:** the day just logged appears. Click **Write this day's journal**, write 2 sentences, **Submit journal**. It shows "Waiting for your coordinator".
- Say: "You can only write a journal for a day you logged hours. The database refuses anything else."

### 3. Approvals, journals and the audit trail (windows 3 and 1, 2 min)
- **Supervisor (window 3):** **Approvals** page: approve the pending hours. Below it, **Student journals** shows the entry, read only.
- **Coordinator (window 1):** **Journals** in the sidebar (count badge). Reject the entry with a note ("add what you learned"). Back in window 2, the student sees the note, edits, and resubmits. The coordinator approves it. Now the student cannot edit it.
- Open the student's page: every approval is in the **change history**, with who did it.

### 4. The evaluation form and the PDF (window 3, 1.5 min)
- Supervisor page, **Your students** table: click **Evaluate** on a student (or **Edit** on one that already has an evaluation). It is the school's own form: 10 criteria, rated 1 to 5.
- **Submit evaluation**, then on the sheet click **Save as PDF**. The file downloads straight away, named `Student Name - School - Evaluation.pdf`. No print dialog.
- Coordinator (window 1): the student's page has an **OJT evaluation** card with the average and **View evaluation**.
- Say: "Students never see this, because the form promises the supervisor's comments are confidential."

### 5. Certificate, for both sides (windows 1 and 2, 1.5 min)
- Open that student's page (their required hours were lowered in the prep step): **Issue certificate** appears.
- Coordinator: **View certificate**, **Save as PDF** (`Name - School - Certificate.pdf`). Student (window 2): **My hours** now shows a **Your certificate** card with the same sheet.

## Part B: companies, safety and the marketplace (7 minutes)

### 6. Companies and the signed MOA (window 1, 1 min)
- **Companies** page: the MOA column shows the dates and an expiry warning. Open **Upload the signed MOA**, pick a PDF, then click its name to open it.
- Say: "Only this school's coordinator can open that file. Supervisors, students and other schools cannot."

### 7. A student applies for an opening (windows 5, 2, 1, 1.5 min)
- **Company B (window 5):** the Company page shows the published opening.
- **Student (window 2):** **OJT openings**, click **Apply for this opening**, write a note, send. **My applications** shows "Waiting for the company".
- **Company B:** **Applications** tab: the student's name, ID, course and school, never the email. **Accept**.
- **Coordinator:** the student's page shows the application. Click **Deploy to Company B**. If the school has no partnership with that company yet, the screen says so: go to **Partnerships**, send Company B a request (or accept theirs), then deploy.
- Say: "The company decides, the school deploys. Accepting does not place anyone."

### 8. A problem is reported, and the accountability chain (windows 2, 1, 4, 3, 3 min)
- **Student:** **Report a problem** (for example, work outside the agreed tasks).
- **Coordinator:** **Reports**. Three choices: **Uphold**, **Do not uphold**, or **Escalate to Dugtong**. Escalate one.
- **Admin (window 4):** **Admin**, **Reports** tab: the escalated report, with the company and school but **never the student's name**. **Uphold** it.
- **Supervisor (window 3):** the report appears under "Upheld reports about your company", also without the student. Click **Appeal this report**, give a reason, **Send appeal**.
- **Admin:** **Reports** tab, **Appeals from companies**: read both sides, **Grant appeal**. The report becomes "not upheld" and disappears from the supervisor's list. The coordinator sees "Appeal granted".
- To show the flag: when a company reaches **3 upheld reports**, the admin's **Repeatedly reported companies** list shows it, with **Mark under review** and **Restore company**. The coordinator then sees an "Under review" badge beside it.

### 9. Linking an offline partner (windows 1 and 5, 1 min)
- Coordinator, **Partnerships**, **Offline partners** card: Sample Company is a company typed in by hand. Click **Link to a Dugtong company**, choose **Company A**, send.
- **Company A (window 5):** **Partnerships** tab, **Link requests from schools**: read the warning, **Accept**.
- Open Sample Company's students: same students, hours and reports, now with a company account behind them. Nothing was copied or lost.

## Closing line (20 seconds)
"Every table has Row Level Security. Each role sees only what it should: students are protected, companies are verified, schools keep control of placement, and Dugtong admins see problems without seeing students."

## Cheat sheet: what to say if asked
- **Where is it stored?** Hosted Supabase. Files are in private buckets and open with a 60-second link.
- **Can a company see student emails?** No. Applications show name, ID, course, school and the student's note only.
- **Can the coordinator edit a student's journal?** No. They can only approve or reject it.
- **What is not built?** The CHED course-list check (a person's job, not code), a Dashboard count of applications waiting to be deployed, and paging done on the server for schools with several thousand students.
