// A row id looks like 3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b. Checking the
// shape before asking the database stops junk in the address bar from
// ever reaching a query.
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
