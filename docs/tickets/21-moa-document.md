# 21 — Store the signed MOA document

**What to build:** A coordinator uploads the signed MOA for a partner company, so the school keeps the document itself and not only its dates.

**Blocked by:** 09.

**Status:** built; `019` applied to the hosted project and its rules tested in the database; the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Team decisions:**
- **Only the coordinator** of the school can open the file. Supervisors, students and other schools cannot.
- PDF, JPEG or PNG, up to 5 MB, in a private bucket, opened with a link that works for 60 seconds (same rules as the company verification documents).
- Every upload is kept; the newest is marked "latest". Nothing is replaced or deleted.

- [x] A coordinator can upload a signed MOA for one of their own companies
- [x] The database refuses a file path in another school's folder
- [x] Supervisors and students cannot read the file records, and nobody can edit one
- [ ] The coordinator can open an uploaded file from the Companies page
- [ ] Works on the live URL
