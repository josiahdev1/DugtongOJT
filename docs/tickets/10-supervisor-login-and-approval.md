# 10 — Supervisor logins and approval of hours

**What to build:** A supervisor at a partner company signs in and approves or rejects the hours of the students placed at their company. The coordinator can still override.

**Blocked by:** 06. **Also blocked by a team decision** (see below).

**Status:** blocked

**Decision needed before building:** `CONTEXT.md` §12.4 says the canonical rule is that the supervisor *records attendance* and the coordinator approves, which conflicts with both the proposal ("supervisor approval") and what we built (coordinator approves). Who approves hours: the supervisor, the coordinator, or both? How is a supervisor invited: by the coordinator adding their email to the company, the same roster-by-email way as students?

- [ ] A supervisor is invited by email on a company and signs in with a confirmed email
- [ ] A supervisor sees and decides only the entries of students placed at their own company
- [ ] The coordinator can still approve, reject or override, and every change is in the change history
- [ ] A supervisor cannot see other companies' students, or any other school's data
- [ ] Works on the live URL
