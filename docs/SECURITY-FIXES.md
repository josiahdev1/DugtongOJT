# Security fixes (penetration test, October 2026)

An authorized penetration test of the `dev` branch found **no Critical or
High** problems. Row Level Security held against every attempt, including
direct calls to the database API that skip the app. It reported 4 Medium,
5 Low and 5 Informational findings. This page records what we did about
each one. The report itself is not kept in the repo.

## Fixed in code

| ID | Finding | What we changed |
|---|---|---|
| F-03 | Missing security headers | `next.config.ts` now sends a Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a Referrer-Policy, a Permissions-Policy and HSTS (production only). Headers add a few bytes and cost no speed. |
| F-03 | `X-Powered-By: Next.js` disclosed | Turned off with `poweredByHeader: false`. |
| F-02 | Session cookie not marked `Secure` | `src/lib/supabase/cookie-options.ts` sets `Secure` in production. It is shared by the server client, the proxy and the browser client. |
| F-04 | Weak passwords (`12345678` accepted) | `src/lib/password.ts`: new sign-ups need 10+ characters, no common passwords, not only digits, and not containing the email name. Existing accounts can still sign in. |
| F-08 | Sign-up email link built from the `Origin` header | The link now comes from `NEXT_PUBLIC_SITE_URL`, or the host the request really reached, never the `Origin` header (`src/app/login/actions.ts`). |
| F-07 | Anyone could become a school coordinator | `supabase/sql/024-create-school-roles.sql`: `create_school` now refuses people on a student roster, company owners and supervisors. The Set up school screen explains the refusal in plain words. |

## Not a problem on `dev`

| ID | Finding | Why |
|---|---|---|
| F-06 | Real project URL/key in `.env.example` | The committed `.env.example` holds placeholders only. (The anon key is public by design; no service key was ever found.) |

## Needs action outside the code (team checklist)

- [ ] Run `supabase/sql/024-create-school-roles.sql` in the Supabase SQL editor (F-07 is not live until this is done).
- [ ] Change every test/default password, especially the admin's (F-04). The new rules only apply to new sign-ups.
- [x] Supabase → Authentication → URL Configuration: Redirect URLs list only the live `/auth/callback` and `http://localhost:3000/auth/callback`, no wildcards (F-08).
- [ ] Optional: set `NEXT_PUBLIC_SITE_URL` in Vercel to the live address (F-08).
- [ ] Turn on Auth rate limits and consider leaked-password protection in the Supabase dashboard (F-01).
- [ ] Delete the sample rows the test left in the database (time entries, one journal entry with test text, one unconfirmed sign-up).
- [ ] Click through login, a MOA upload and a PDF save on the live URL once, to confirm the Content-Security-Policy blocks nothing.

## Decided not to do (for now)

- **F-02, `HttpOnly` cookie:** the two browser-side uploaders read the session cookie, so `HttpOnly` would break uploads. It needs the uploads moved to the server first.
- **F-05, explicit role check in every server action:** each check adds an extra request to Supabase on every action. Row Level Security already blocks abuse (the test confirmed it), so we kept speed. Revisit if RLS policies change.
- **F-01, in-app rate limiting:** an in-memory limiter does not work reliably on serverless hosting. Use the Supabase dashboard limits instead.
- **F-09 (login alerts), F-10, F-12, F-14:** operations or informational items, no code change.
- **F-11:** dev-only lint toolchain advisories; ignored per `CLAUDE.md`.
- **F-13:** `/admin` loading screen for non-admins: to be checked on a production build.
- **Nonce-based CSP:** the policy allows inline scripts because Next.js needs them. A stricter nonce setup is a later improvement.
