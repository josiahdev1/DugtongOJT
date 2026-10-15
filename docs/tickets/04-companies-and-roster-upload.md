# 04 — Companies and roster upload

**What to build:** The coordinator adds a partner company, uploads a CSV of sample students, previews the rows and confirms. The Dashboard then lists those students with their company and required hours.

**Blocked by:** 03

**Status:** todo

- [x] The coordinator can add a company with a name and supervisor name (the `companies` table, RLS on, only that school's coordinator reads and writes)
- [x] The coordinator can upload a CSV (name, student ID, course, email, company, required hours) and see a preview before confirming
- [x] Confirming saves the students to the `students` table with emails stored in lowercase and each student assigned to a company (RLS on: the coordinator reads and writes their school's rows only)
- [x] The Dashboard lists each student with company and required hours
- [x] All demo students are sample data and clearly labelled as such
- [ ] Works on the live URL
