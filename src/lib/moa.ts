// How many days before expiry a MOA counts as "expiring soon".
export const MOA_WARNING_DAYS = 30;

export type MoaStatus =
  | { kind: "none" }
  | { kind: "valid"; expiresOn: string }
  | { kind: "expiring"; expiresOn: string; daysLeft: number }
  | { kind: "expired"; expiresOn: string };

function daysBetween(from: string, to: string) {
  const ms =
    new Date(`${to}T00:00:00Z`).getTime() -
    new Date(`${from}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

// Where a MOA stands today. `today` and `expiresOn` are YYYY-MM-DD, with
// "today" in Manila time (see todayInManila). A MOA is still valid ON its
// expiry date and expired from the day after.
export function moaStatus(
  expiresOn: string | null,
  today: string,
): MoaStatus {
  if (!expiresOn) return { kind: "none" };
  if (expiresOn < today) return { kind: "expired", expiresOn };

  const daysLeft = daysBetween(today, expiresOn);
  return daysLeft <= MOA_WARNING_DAYS
    ? { kind: "expiring", expiresOn, daysLeft }
    : { kind: "valid", expiresOn };
}

export function describeMoa(status: MoaStatus): string {
  switch (status.kind) {
    case "none":
      return "No MOA dates";
    case "valid":
      return `Valid until ${status.expiresOn}`;
    case "expiring":
      return status.daysLeft === 0
        ? "Expires today"
        : `Expires in ${status.daysLeft} ${status.daysLeft === 1 ? "day" : "days"}`;
    case "expired":
      return `Expired ${status.expiresOn}`;
  }
}

// True when the coordinator needs to look at this MOA.
export function needsAttention(status: MoaStatus) {
  return status.kind === "expiring" || status.kind === "expired";
}

// Reads an optional date from a form field. Blank is fine (the date is
// optional); anything else must be a real calendar date, so "2026-02-31"
// is refused instead of silently turning into March.
export function parseOptionalDate(
  raw: FormDataEntryValue | null,
): { ok: true; value: string | null } | { ok: false } {
  const text = String(raw ?? "").trim();
  if (text === "") return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return { ok: false };
  const d = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== text) {
    return { ok: false };
  }
  return { ok: true, value: text };
}
