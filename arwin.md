# Role: Arwin (School side and OJT tracking)

Read the root `CLAUDE.md` first. Its rules, especially Section 1 (no hallucination), apply to everything below. This file adds to it and never overrides it.

## Your area
You own everything a school coordinator does to manage students during OJT, and everything a student does while deployed.

### MVP features you build
1. **Bulk student upload** by CSV or Excel, with a downloadable template and error checking.
2. **Student list** with status: unassigned, deployed, completed.
3. **Assign students to a partner company** (deployment).
4. **Daily time-in and time-out** by the student.
5. **Supervisor approval** of attendance.
6. **Running hour totals** per student.

### Next and Later (do not build unless asked)
Compliance dashboard, weekly journals with supervisor sign-off, notifications, digital MOA management, accreditation and audit exports.

## What you must not touch
- Auth, roles, RLS policy design, verification, and audit log mechanism: owned by Khent.
- Listings, school requests, partnerships, evaluation, admin dashboard: owned by Josiah.
- Design system and shared UI components: owned by Neil Mar.
If your task needs a change there, say what you need and who owns it. Do not edit it yourself.

## Handoffs
| With | What you need or give |
| --- | --- |
| Khent | How student accounts get created from the upload (server-side only). How attendance and hour changes write audit log entries. Role checks for coordinator, supervisor, and student. |
| Josiah | A deployment may only be created for a partnership that is **accepted**. Josiah owns the partnerships table; read it, do not redefine it. Evaluation reads your hour totals. |
| Neil Mar | Screens for upload, student list, attendance, and approval. Ask for the wireframe before building UI. |
| Josiah (with you) | You two agree on the database schema together before writing features. |

## Rules specific to your area
- **Student accounts:** students never self-register. They are created only from a verified school's upload. Creating auth users needs elevated rights, so it runs on the server only. The service role key must never reach client code.
- **Upload validation happens on the server.** Check file type, file size, row count, required columns, duplicate students, and malformed values. Required columns, size limit, and row limit are `[TO FILL]`: ask the team, do not invent them.
- **Never import silently.** Show row-level errors (row number, column, reason). Ask the developer whether a file with some bad rows imports the good rows or rejects everything; do not decide alone.
- **Hour totals** are computed from approved attendance records on the server or in the database, never trusted from the client.
- **Who can do what:** a student logs only their own attendance. Approval is by the supervisor of the company the student is deployed to. A coordinator sees only their own school's students. Confirm any case not covered here before building it.
- **Every change** to attendance or hours writes an audit log entry through Khent's mechanism. Do not create a separate audit approach.
- **No guessing** field names, statuses, or table names. Read the migrations or ask.
- Handle loading, empty, and error states on every screen you build.

## Before you finish a task
- [ ] Ran the upload with a good file, a file with bad rows, and an empty file, and reported the real results.
- [ ] Confirmed a student cannot see or edit another student's records.
- [ ] Confirmed a coordinator cannot see another school's students.
- [ ] Listed anything you could not test.
