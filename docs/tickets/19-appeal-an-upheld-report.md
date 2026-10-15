# 19 — A company appeals an upheld report

**What to build:** The supervisor at a company can appeal a misuse report that the school upheld about their company. A Dugtong admin decides the appeal. If it is granted, the report is no longer upheld.

**Blocked by:** 11, 17.

**Status:** built; `017` applied to the hosted project and its rules tested in the database; the supervisor screen was tried with a real login; the admin and coordinator screens still need a click-through

**Team decisions:**
- The company's **supervisor** appeals, **once per report**, with a written reason (10 to 2000 characters).
- A **Dugtong admin** decides the appeal, and the decision is final. The coordinator does not review their own decision.
- If the appeal is **granted**, the report becomes "not upheld": the supervisor stops seeing it, the student's report shows "Not upheld", and the coordinator sees "Appeal granted". If it is **denied**, the report stays upheld.
- The admin sees the report text, the company, the school and the company's reason, **never the student**.
- A granted appeal does not restore a flagged company by itself; an admin does that on the Reports tab (ticket 17).

- [x] A supervisor can appeal an upheld report about their company once, with a reason
- [x] A supervisor cannot appeal a report that is not upheld, or one about another company (not upheld: tested; another company: enforced by the database policy, not tested)
- [x] Only an admin can decide an appeal, and the decision is final
- [x] A granted appeal turns the report into "not upheld"; a denied appeal changes nothing
- [x] The supervisor sees their appeals and each one's status
- [x] The coordinator sees that a report was appealed and the outcome
- [ ] Works on the live URL
