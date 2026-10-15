# 20 — Link an offline partner to the same company on the platform

**What to build:** A coordinator typed a company in (an offline partner). Later that company joins Dugtong. The coordinator can propose linking the two, the company accepts, and from then on they are one company: same students, hours and reports, now with a Dugtong account behind them.

**Blocked by:** 15.

**Status:** built; `018` applied to the hosted project and its rules tested in the database; the coordinator and company screens still need a click-through with real logins

**Team decisions:**
- The **coordinator proposes** the link, the **company accepts**. Nothing changes until the company accepts, because linking gives that company's account access to the students placed there.
- Linking changes the existing company row, so students, hours, reports, evaluations, MOA dates and supervisors all stay exactly where they are.
- The coordinator can only link to a **verified** company that has **no partnership or request with their school yet**. (If the school already has a platform partnership with that company, there would be two company rows for it; merging those is not part of this ticket.)
- An offline partner can have one live link request at a time. A declined request can be sent again.

- [x] A coordinator can propose linking one of their offline partners to a verified company that has no partnership with their school
- [x] Only the proposed company can accept or decline, and nothing changes until it accepts
- [x] After acceptance the partner is a platform partner: same company row, students and data unchanged, shown on the company's account
- [x] A coordinator cannot link a company that is already a platform partner, or one that is not verified
- [x] The coordinator sees the status of each link request
- [x] The company sees link requests waiting for its answer
- [ ] Works on the live URL
