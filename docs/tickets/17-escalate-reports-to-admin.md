# 17 — Escalate a misuse report to a Dugtong admin

**What to build:** A coordinator who cannot resolve a misuse report can escalate it to a Dugtong admin, who decides it. A company that keeps getting reports is flagged for the admins automatically, and an admin can mark it "under review" or restore it.

**Blocked by:** 11, 16.

**Status:** built; `016` applied to the hosted project and its rules tested in the database; the coordinator and admin screens still need a click-through with real logins

**Team decisions:**
- The coordinator escalates a report that is still waiting for their decision. The admin then upholds or does not uphold it, and that decision is final.
- A company is flagged automatically when it has **3 upheld reports**. After an admin restores it, only reports upheld afterwards count towards the next flag.
- The admin sees the report, the school and the company, but **never the student's name**.
- "Under review" is a label for now: it is shown to the admins and to the coordinator. It does not block placements.

- [x] A coordinator can escalate a waiting report; after that they can no longer decide it themselves
- [x] Only an admin can decide an escalated report, and the decision is final and records who decided
- [x] An upheld escalated report shows to the company's supervisor like any upheld report, without the student's name
- [x] The third upheld report about a company flags it for the admins, without anyone clicking
- [x] An admin can mark a flagged company "under review" or restore it
- [x] The coordinator sees "Under review" next to the company on their Misuse reports page
- [x] A student sees "Escalated to Dugtong" on their own report
- [ ] Works on the live URL
