# 13 — Company accounts and admin verification

**What to build:** A company can sign up and upload proof of registration. A Dugtong admin reviews it and verifies (or rejects) the company before it can post anything.

**Blocked by:** 16 (the admin role, built there).

**Team decisions made:** Admins are in an `admins` table, confirmed by Khent; users cannot add themselves, and new admins are added only by the team leader in the Supabase dashboard. A company must upload (1) a DTI or SEC registration and (2) a mayor's or business permit, and must type the name and position of an authorized representative (no ID upload). Documents go in a private storage bucket, opened only through short-lived links by the company and Dugtong admins. The document list is to be confirmed against CHED and the pilot school's requirements.

**Status:** todo

- [x] A user can set up a company account with a company name and an authorized representative's name and position; it starts as "waiting for review"
- [x] The company uploads its registration and its permit (PDF, JPEG or PNG, up to 5 MB) into a private bucket, only into its own folder
- [x] No one but the owning company and an admin can open a document, and only through a link that lasts 60 seconds
- [x] An admin sees every company with the representative, the owner's email and both documents, and can verify, reject or send it back to waiting
- [x] A company cannot change its own status, or anyone else's documents
- [ ] Works on the live URL
