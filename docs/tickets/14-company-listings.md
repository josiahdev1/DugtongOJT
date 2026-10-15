# 14 — Company OJT listings (public browse)

**What to build:** Verified companies post OJT openings with a defined scope of tasks. Anyone can browse the public listings without an account.

**Blocked by:** 13.

**Team decisions made:** Public fields are company name, verified label, course, number of slots, required hours, schedule and hours per day, scope of tasks, city or municipality, and an optional role title (confirmed with Josiah). Never public: contact details, documents, internal notes, assigned students, and trust scores. Course is chosen from a fixed list. Filters: course (dropdown) and required hours (shows listings offering at least the hours entered). A listing cannot be published without a scope of tasks.

**Status:** todo

- [x] A verified company can save a listing as a draft, publish it, close it and reopen it; it cannot publish without a scope of tasks (at least 20 characters)
- [x] An unverified company can save drafts but cannot publish
- [x] A public page at `/listings`, with no sign-in, shows published listings of verified companies with only the agreed public fields
- [x] The public page filters by course (a dropdown) and by "at least this many required hours"
- [x] Nothing else about a company or its students is readable by a visitor, and a listing disappears when it is closed or its company is no longer verified
- [ ] Works on the live URL

**Not built:** editing the fields of an existing listing. A company closes a listing and posts a new one instead.

**Assumption to confirm:** the fixed course list is a starter list of 14 common programs (in `supabase/sql/012-listings.sql`). Please confirm it against the pilot school's programs; it can be changed in SQL.
