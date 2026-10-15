# 25 — Students apply for a listing

**What to build:** A student applies for an open listing from the public openings page, with a short note. The company accepts or declines. If it accepts, the school's coordinator places the student.

**Blocked by:** 14, 15.

**Status:** built; `021` and `023` applied to the hosted project and their rules tested in the database; the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Team decisions:**
- The **company decides**, the **coordinator deploys**. Accepting does **not** place the student, because placement needs a partnership between the company and the school.
- A student can have at most **5 applications waiting**, applies once per opening, and can **withdraw** a waiting application (and apply again later).
- A company sees the student's **name, ID, course, school and note**, never their email.
- The coordinator deploys a student only to the school's placement company that belongs to the **same company account**, which means the school must already have a partnership with that company. If not, the screen says to partner with the company first.
- The course on the opening is shown but is **not** matched against the student's course.

- [x] A student applies for a published opening of a verified company, once, and cannot apply for a draft or an opening of an unverified company
- [x] A student cannot accept their own application, and cannot change one that was answered
- [x] Only the company that owns the opening can answer, once; another company cannot
- [x] The company's list has no email column
- [x] The coordinator can deploy an accepted application only when the school has a partnership with that company, and the student moves to that company
- [x] A student can withdraw a waiting application, and cannot withdraw an accepted one
- [ ] The student sees "Apply" on the openings page and their status on My applications
- [ ] The company sees an Applications tab, and the coordinator sees the applications and a Deploy button on the student's page
- [ ] Works on the live URL
