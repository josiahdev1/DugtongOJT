# 03 — Coordinator signs in and names a school

**What to build:** A coordinator can sign up, confirm their email, sign in and name their school once. After sign-in, coordinators land on an empty Dashboard. Anyone who is neither a coordinator nor on a roster sees a "you are not on a roster" message and nothing else.

**Blocked by:** 02

**Status:** todo

- [x] Email and password sign-up and sign-in work, with email confirmation turned on in Supabase
- [x] First-time "Set up school" creates the school and links the coordinator to it (the `coordinators` table, with RLS on and policies matching the spec)
- [x] A coordinator cannot link themselves to a school they did not create
- [x] A signed-in coordinator is sent to the Dashboard; a user who is not a coordinator and not on a roster sees only the "not on a roster" message
- [x] Signing out works
- [ ] Works on the live URL
