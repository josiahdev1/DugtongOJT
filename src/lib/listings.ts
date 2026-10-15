// What a listing looks like on the public page (the fields of the
// `public_listings` view, nothing more).
export type PublicListing = {
  id: string;
  employer_id: string;
  company_name: string;
  verified: boolean;
  course: string;
  slots: number;
  required_hours: number;
  schedule: string;
  hours_per_day: number;
  scope_of_tasks: string;
  city: string;
  role_title: string | null;
  published_at: string;
};

export const LISTING_STATUS_LABEL: Record<string, string> = {
  draft: "Draft (not public)",
  published: "Published",
  closed: "Closed",
};

// Reads the "at least this many required hours" filter from the address
// bar. Anything that is not a whole number from 1 to 2000 is ignored.
export function parseMinHours(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 2000 ? n : null;
}
