# 13 — Company accounts and admin verification

**What to build:** A company can sign up and upload proof of registration. A Dugtong admin reviews it and verifies (or rejects) the company before it can post anything.

**Blocked by:** 05. **Also blocked by team decisions** (see below).

**Status:** blocked

**Decisions needed before building:** how admins are stored (an `admins` table or sign-in token claims; `CONTEXT.md` says Khent decides); exactly which documents a company must upload (DTI or SEC, business permit, authorised representative?). Documents need a private storage bucket with short-lived links, which is also a new area to set up.

- [ ] A company can sign up and upload its documents to a private bucket
- [ ] An admin screen lists pending companies and lets an admin verify or reject them
- [ ] Only the owning company and admins can open its documents
- [ ] An unverified company cannot post listings
- [ ] Works on the live URL
