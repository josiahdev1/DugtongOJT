# 23 — Paging on the Dashboard student list

**What to build:** The coordinator's student list shows 25 students at a time with Previous and Next, and the Dashboard never silently drops students when a school has more than 1000.

**Blocked by:** 06.

**Status:** built; no database change; the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Notes:**
- Search (name, student ID, course, company) and the All / Waiting / Completed tabs already existed. Paging was added on top, and a search or tab change goes back to page 1.
- Supabase returns at most 1000 rows per request and does not say when it cuts a list short. The Dashboard now asks for students and their hours 1000 at a time until it has all of them, so the totals stay right.
- Everything still loads in one go. If a school grows to several thousand students, the next step is to page on the server.

- [ ] The list shows 25 students per page and "Showing 1–25 of N"
- [ ] A search or tab change returns to page 1, and the page numbers stay valid when the list shrinks
- [ ] A school with more than 1000 students sees all of them in the list and the totals
- [ ] Works on the live URL
