# 11 — Misuse reporting

**What to build:** A student can report out-of-scope work, unsafe conditions or unrecorded overtime. The report goes to their school coordinator, who decides it.

**Blocked by:** 05. (Team decisions made: three statuses, `submitted`, `upheld` and `not_upheld`. Only the coordinator moves a report from submitted, and the decision is final. The coordinator sees who filed it. A supervisor sees a report only after it is upheld, and never the student's name. A report that is not upheld is never shown to the company. No escalation to an admin for now; escalation and company appeals are in `docs/LATER.md`.)

**Status:** todo

- [ ] A student can file a report with a type (work outside the agreed tasks, unsafe conditions, unrecorded overtime), a day within the last 90 days, and a description of at least 10 characters
- [ ] A student can find "Report a problem" from their My hours page, and sees only their own reports and each one's status
- [ ] The coordinator sees a list of their school's reports with the student's name, and can uphold or not uphold each one; the decision is final and records who decided and when
- [ ] The Dashboard shows how many reports are waiting
- [ ] A supervisor sees a report only once it is upheld, only for their own company, and never who filed it; a report that is not upheld never reaches the company
- [ ] Nobody but the student and their school's coordinator can read a submitted report
- [ ] Works on the live URL
