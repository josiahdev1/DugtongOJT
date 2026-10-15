# 15 — Partnership requests

**What to build:** Either a school or a verified company can send a partnership request. Only the receiving side can accept or decline. An accepted partnership is what lets a school assign students to a company.

**Blocked by:** 13, 14.

**Team decisions made:** Companies the coordinator types in become offline partners: a partnership record created directly as accepted, marked offline (no company account), based on an existing signed MOA. Platform partnerships use `requested`, then `accepted` or `declined`, and no other states. Deployments require an accepted partnership of either kind. Offline partners are not an exception to "the sender cannot accept their own request", because no request exists: the MOA is the agreement. Linking an offline partner to a company that later joins the platform is in `docs/LATER.md`.

**Status:** todo

- [x] A coordinator at a verified school can ask a verified company to partner (from the public openings page); a verified company can ask a verified school
- [x] Only the side that received a request can accept or decline it; the sender cannot answer their own request, and nobody else can
- [x] An answered request cannot be answered again, and a declined pair cannot ask again
- [x] Accepting creates the school's placement company for that partner (named like the company; labelled "(platform)" if the coordinator already typed in one with the same name)
- [x] A company the coordinator types in becomes an offline partner: an accepted partnership with no request, and every company already in the system was backfilled the same way
- [x] Students can only be assigned to a company that has an accepted partnership, of either kind, and the database refuses otherwise
- [x] A coordinator cannot link a company to a platform company, or create a partnership, by hand
- [x] Each side sees only its own partnerships, and a company never sees students
- [ ] Works on the live URL
