# 02 — Connected to Supabase

**What to build:** The app talks to the hosted Supabase project, locally and on the live site. The `schools` table exists with Row Level Security on and explicit policies, and the live site can read from it.

**Blocked by:** 01

**Status:** todo

- [x] Supabase URL and publishable (anon) key are set in the local env file and in Vercel
- [x] No secret or service-role key appears anywhere in the project, and the local env file is not committed
- [x] The `schools` table is created from a numbered SQL file with RLS on and policies matching the spec (a coordinator reads and updates only their own school; any signed-in user may create one)
- [x] The live site reads from Supabase without errors
- [ ] Works on the live URL
