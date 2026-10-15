import type { DailyHours, WeeklyThroughput, WeeklyEscalation } from "./admin-charts";
import type { EmployerRow } from "./employers-card";
import type { AppealRow, EscalatedReportRow } from "./reports-card";

type SchoolItem = {
  created_at: string;
};

export function getThirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

export function buildDailyHoursSlots(hoursByDate: Map<string, number>): DailyHours[] {
  const slots: DailyHours[] = [];
  const base = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const displayDate = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const realHours = hoursByDate.get(dateStr) ?? 0;
    const hours = Math.round(realHours * 10) / 10;

    slots.push({
      date: dateStr,
      displayDate,
      hours,
    });
  }
  return slots;
}

export function buildWeeklySignups(
  schools: SchoolItem[],
  employers: EmployerRow[],
): WeeklyThroughput[] {
  const res: WeeklyThroughput[] = [];
  const now = Date.now();

  for (let w = 7; w >= 0; w--) {
    const start = now - (w + 1) * 7 * 24 * 60 * 60 * 1000;
    const end = now - w * 7 * 24 * 60 * 60 * 1000;
    const weekLabel = `Wk ${8 - w}`;

    const verifiedSchoolsInWeek = schools.filter((s) => {
      const t = new Date(s.created_at).getTime();
      return t >= start && t < end;
    }).length;

    const verifiedEmployersInWeek = employers.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= start && t < end;
    }).length;

    res.push({
      week: weekLabel,
      schools: verifiedSchoolsInWeek,
      companies: verifiedEmployersInWeek,
    });
  }

  return res;
}

export function buildWeeklyEscalations(
  escalated: EscalatedReportRow[],
  appeals: AppealRow[],
): WeeklyEscalation[] {
  const res: WeeklyEscalation[] = [];
  const now = Date.now();

  for (let w = 11; w >= 0; w--) {
    const start = now - (w + 1) * 7 * 24 * 60 * 60 * 1000;
    const end = now - w * 7 * 24 * 60 * 60 * 1000;
    const weekLabel = `Wk ${12 - w}`;

    const escalatedInWeek = escalated.filter((r) => {
      const t = new Date(r.escalated_at).getTime();
      return t >= start && t < end;
    }).length;

    const appealsInWeek = appeals.filter((a) => {
      const t = new Date(a.created_at).getTime();
      return t >= start && t < end;
    }).length;

    const count = escalatedInWeek + appealsInWeek;

    res.push({
      week: weekLabel,
      count,
    });
  }

  return res;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole days since an ISO timestamp (never negative).
export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS));
}

// "just now", "12 min ago", "3 hr ago", "5 days ago".
export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
