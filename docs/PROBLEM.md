# Dugtong

> **Status: draft.** No coordinator has been interviewed yet. Everything
> under "The struggle" and "Today's workaround" is the project proposal's
> claim, **to be confirmed**, not something the team has observed.
> Update this file after the coordinator conversation.

## Who
One OJT (on-the-job training) coordinator at one school. They are the
paying customer and the one user we design for. Students are helper
users who only log their own time.

Pilot coordinator: **__________** at **__________** (to be named; talk to
them by **__________**).

## The struggle
*Proposal's claim, to be confirmed:* coordinators spend weeks on
paperwork tracking hours, journals and evaluations for hundreds of
students, instead of supporting students.

Still to observe: a real recent occasion ("Last ___, Ma'am/Sir ___
needed to ___, so they ___") and real numbers (students per term, hours
per week on paperwork, minutes to prepare one student's final hours
summary).

## Today's workaround
*Proposal's claim, to be confirmed:* paper records and spreadsheets,
assembled by hand per student. Open question: how are hours verified
today (signed DTR, supervisor signature, something else)?

## The MVP
The coordinator uploads a student roster, students log their own daily
hours, the coordinator approves them, and one click produces a PDF hours
report for a student.

## How we'll know it worked
Demo (three minutes): add one partner company, upload 5 fake students
and assign them to it, one student logs a day's time-in and time-out,
the coordinator approves it and the hour total updates, then one click
generates the student's hours report.

Success measure: "Coordinator ______ produces a student's hours report
in under ___ minutes, versus ___ minutes today." Both blanks come from
the coordinator conversation. A teammate playing coordinator is a test
fallback, not proof.

## Constraints
- Demos and tests use fake students only, labelled as sample.
- Data collected: student name, student ID, course, email, assigned
  company, required hours; company name and supervisor name; time
  entries (date, time-in, time-out, approval status, who approved, when).
- Never store grades, government IDs or addresses.
- Every record belongs to a school, so isolation is ready when a second
  school joins. Row Level Security (RLS) stops one student seeing
  another's data.
- Students are added only through the coordinator's roster upload. A
  student signs in with a verified email (magic link, or email
  confirmation on if passwords are used). RLS compares the verified
  session email to the roster email, both lowercase. An email not on a
  roster sees and logs nothing. No service-role key anywhere.
- Once approved, a time entry cannot be edited by the student. Any later
  change is recorded with who, when, and old and new values.
- The spec must state two deliberate cuts from the proposal: the
  coordinator (not a supervisor) approves hours, and there is no
  evaluation rating.

## Out of scope
- Marketplace connecting schools to companies
- Company verification (DTI/SEC, permits) and partnership requests
- Misuse reporting
- MOA expiry tracking
- Supervisor logins
- Evaluation rating and the evaluation form
- Completion certificate
- Onboarding more than one school

## Glossary
- **Coordinator**: the school's OJT coordinator; the one paying user.
- **Student**: someone on OJT who logs only their own time.
- **Partner company**: a company the coordinator already has a signed
  MOA with, typed in by the coordinator and checked by no one.
- **Placement**: the coordinator assigning a student to a partner
  company.
- **Roster**: the list of students the coordinator uploads; a student
  can only use the app if their email is on it.
- **Time entry**: one day's time-in and time-out, logged by the student.
- **Approved hours**: time entries the coordinator has approved; the
  only hours counted in the report.
- **Hours report**: PDF showing student, company, daily entries,
  approved hours and progress toward required hours.
- **DTR**: daily time record, the signed paper log of hours.
- **MOA**: memorandum of agreement between school and company.
