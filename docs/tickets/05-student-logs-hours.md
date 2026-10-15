# 05 — Student logs hours

**What to build:** A student whose email is on a roster can sign in, log a day's time-in and time-out, and see their own entries as pending. Nobody else's data is visible to them.

**Blocked by:** 04

**Status:** todo

- [ ] A student signs up with their rostered email, confirms it, signs in and lands on My hours
- [ ] The student is matched to their roster row by the verified email of the signed-in session, compared in lowercase, never by an email the browser sends
- [ ] The student can log a date, time-in and time-out; the entry is saved as pending (the `time_entries` table, RLS on)
- [ ] The student sees only their own entries with their status, and may edit them only while pending
- [ ] A student cannot see another student's entries or roster row
- [ ] An email not on any roster sees nothing and cannot log hours
- [ ] Works on the live URL
