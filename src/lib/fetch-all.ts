// Supabase returns at most 1000 rows per request, and says nothing when it
// cuts a list short. A school with more than 1000 students would silently
// lose some from the Dashboard and its totals. This asks for the rows one
// page of 1000 at a time until there are no more.
//
// The query must have a stable, unique order (for example .order("id")),
// or a row could appear on two pages or on none.
export async function fetchAll<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
  size = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data } = await page(from, from + size - 1);
    if (!data) break;
    rows.push(...data);
    if (data.length < size) break;
  }
  return rows;
}
