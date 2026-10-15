# 18 — Student journal

**What to build:** A student writes a short journal about what they did and learned on a day they worked, and the coordinator approves it. Students can read their own journal entries and see whether each one is approved.

**Blocked by:** 05, 06.

**Status:** built; `022` applied to the hosted project and its rules tested in the database; the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Where this comes from:** `docs/PROBLEM.md` lists journals as part of the paperwork this app replaces, and `docs/Design.md` describes a student journal and a coordinator journal approval queue. Neither was specified before, so it was not built.

**Team decisions:**
- **One entry per day the student logged hours**, text only (20 to 2000 characters).
- The **coordinator** approves or rejects it; a rejection needs a note saying what to fix. The supervisor can **read** their students' entries but never approves them.
- The journal is **separate from hours**: approving hours does not need a journal, and a journal does not approve hours.
- The student can write and edit an entry until it is **approved**. Editing a rejected entry sends it again for approval.

- [x] A student writes an entry only for a day they logged hours
- [x] A rejected entry can be fixed and goes back to "waiting", with the old note cleared
- [x] An approved entry is locked, and the coordinator cannot change what the student wrote
- [x] A supervisor can read their students' entries but cannot approve them
- [ ] The student sees their days and each entry's status on My journal
- [ ] The coordinator sees a queue on the Journals page (and a count on the Dashboard) and approves or rejects each entry
- [ ] A student cannot read or change another student's entries (the database policy enforces it; only one student login exists to test with)
- [ ] Works on the live URL
