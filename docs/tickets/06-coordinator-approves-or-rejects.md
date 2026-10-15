# 06 — Coordinator approves or rejects

**What to build:** The coordinator opens a student, sees their time entries and approves or rejects each one. Approved hours add up on both the Dashboard and the student's My hours page. Approved entries are locked, and any later change is recorded.

**Blocked by:** 05

**Status:** todo

- [x] The Dashboard shows a pending-approvals count and approved hours against required hours for each student
- [x] The Student detail page lists that student's entries with Approve and Reject buttons
- [x] Approving records who approved and when, and the approved total updates on the Dashboard and on the student's My hours page
- [x] Only that school's coordinator can change an entry's status; a student cannot approve their own hours
- [x] Once approved, a student cannot edit the entry
- [x] Any change to an entry after approval is recorded automatically by the database with who, when, and old and new values (the `time_entry_changes` table, readable by the coordinator, writable by nobody directly)
- [ ] Works on the live URL
