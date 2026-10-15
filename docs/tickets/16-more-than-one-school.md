# 16 — More than one school

**What to build:** A second school can sign up and use Dugtong without seeing the first school's data, and an admin on the Dugtong team verifies schools from a screen instead of in SQL.

**Blocked by:** None. (The admin role this needed is built here: an `admins` table, decided with the team.)

**Status:** todo

**What already worked before this ticket:** every record belongs to a school, a school's data is invisible to other schools (tested with two schools), and a new school starts unverified.

- [ ] An admin screen lists every school, with its coordinator's email and counts, waiting schools first
- [ ] An admin can verify a school and remove its verification
- [ ] Only admins can use it: everyone else gets a "not found" page, and the database functions refuse them
- [ ] Nobody can read or change the list of admins through the app
- [ ] A coordinator can never verify their own school
- [ ] Works on the live URL
