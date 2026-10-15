# 24 — Edit a listing after it is posted

**What to build:** A company can edit the details of one of its own openings (course, role, slots, hours, schedule, city, scope of tasks), whether it is a draft, published or closed. Today it has to close it and post a new one.

**Blocked by:** 14.

**Status:** built; no database change (the existing rules already let a company edit only its own listings); the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Notes:** the status is not changed by an edit (except "Save and publish" on a draft). A listing that is not a draft still needs a scope of tasks of at least 20 characters, and only a verified company can publish; the database enforces both. A published listing's changes show on the public page straight away.

- [ ] A company can open an Edit page from its openings table and save changes
- [ ] A company cannot open or edit another company's opening
- [ ] A published opening cannot be saved without a scope of tasks
- [ ] Works on the live URL
