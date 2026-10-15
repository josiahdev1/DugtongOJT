// Dates and times for time entries. The school and its students are in
// the Philippines, so "today" means today in Manila — not wherever the
// server happens to be (Vercel servers run on UTC, 8 hours behind).
const TZ = "Asia/Manila";

/** Today in Manila as YYYY-MM-DD. */
export function todayInManila(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** YYYY-MM-DD shifted by a number of days (negative = earlier). */
export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** How many days back a student may log. */
export const MAX_DAYS_BACK = 30;

/** Hours between two "HH:MM" or "HH:MM:SS" times, e.g. 8.5. */
export function hoursBetween(timeIn: string, timeOut: string): number {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return (toMinutes(timeOut) - toMinutes(timeIn)) / 60;
}

/** "08:00:00" -> "08:00". */
export function shortTime(t: string): string {
  return t.slice(0, 5);
}

/** 8 -> "8", 8.5 -> "8.5", 7.333 -> "7.33". */
export function formatHours(h: number): string {
  return String(Math.round(h * 100) / 100);
}
