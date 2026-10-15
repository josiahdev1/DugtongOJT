# 22 — A student sees their own certificate

**What to build:** Once the coordinator issues a completion certificate, the student can open it from their My hours page and save it as a PDF.

**Blocked by:** 08.

**Status:** built; `020` applied to the hosted project and its rule tested in the database; the screens were type-checked and built, and the pages that load for a supervisor were tried with a real login; the student, coordinator and company screens still need a click-through with real logins

**Notes:** a student cannot read the certificates or schools tables. A database function returns only their own certificate, with the school's and company's names, as it was stored when it was issued. The coordinator's page and the student's page use the same sheet, so they always match.

- [x] A student sees only their own certificate, and a supervisor gets nothing from the same function
- [ ] The My hours page shows a "Your certificate" card once one is issued, and the certificate saves as a PDF named with the student's name and school
- [ ] Works on the live URL
