# 16 — More than one school

**What to build:** A second school can sign up and use Dugtong without seeing the first school's data, and the Dugtong team can verify schools from a screen instead of in SQL.

**Blocked by:** 13 (it needs the admin role).

**Status:** blocked

**What already works:** every record already belongs to a school, a school's data is already invisible to other schools, and a new school starts unverified. This was tested with two schools. What is left is the admin screen for verifying schools, and a decision on whether one school can have more than one coordinator.

- [ ] An admin screen lists schools waiting for verification and lets an admin verify them
- [ ] Only admins can verify; a coordinator can never verify their own school
- [ ] Two schools can run side by side with no data visible across them
- [ ] Works on the live URL
