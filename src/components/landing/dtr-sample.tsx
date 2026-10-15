import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// A made-up page of the daily time record every OJT student already carries
// on paper, drawn the way the product really shows it. It is a picture, not
// data, so it says "Sample" in plain words and uses an invented student.
const ROWS = [
  { day: "Mon 13", timeIn: "08:00", timeOut: "17:00", hours: 9, status: "approved" },
  { day: "Tue 14", timeIn: "08:30", timeOut: "16:30", hours: 8, status: "approved" },
  { day: "Wed 15", timeIn: "08:00", timeOut: "12:00", hours: 4, status: "pending" },
  { day: "Thu 16", timeIn: "08:00", timeOut: "20:00", hours: 12, status: "rejected" },
] as const;

const BADGE = {
  approved: ["approved", "Approved"],
  pending: ["pending", "Pending"],
  rejected: ["rejected", "Rejected"],
} as const;

export function DtrSample() {
  const approved = ROWS.filter((r) => r.status === "approved").reduce(
    (sum, r) => sum + r.hours,
    0,
  );

  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-[12px] border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,.04),0_12px_32px_rgba(15,23,42,.08)]">
        <div className="flex items-start justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <div>
            <p className="font-heading text-base font-medium tracking-tight text-foreground">
              Daily time record
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sample Student · BS Information Technology
            </p>
            <p className="text-xs text-muted-foreground">Sample Company, Iloilo City</p>
          </div>
          <Badge variant="secondary">Sample</Badge>
        </div>

        <table className="w-full text-sm">
          <caption className="sr-only">A sample week of daily time entries</caption>
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="px-5 py-2 text-left font-medium">Day</th>
              <th scope="col" className="px-2 py-2 text-left font-medium">In</th>
              <th scope="col" className="px-2 py-2 text-left font-medium">Out</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Hours</th>
              <th scope="col" className="px-5 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.day} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">{r.day}</td>
                <td className="px-2 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {r.timeIn}
                </td>
                <td className="px-2 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {r.timeOut}
                </td>
                <td className="px-2 py-3 text-right font-mono text-xs tabular-nums text-foreground">
                  {r.hours}
                </td>
                <td className="px-5 py-3 text-right">
                  <Badge variant={BADGE[r.status][0]}>{BADGE[r.status][1]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* On paper this is the supervisor's signature. Here it is a record. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-teal-text" aria-hidden="true" />
            Mon and Tue approved by the supervisor
          </span>
          <span className="font-mono tabular-nums">Tue 14 · 5:12 PM</span>
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-surface px-5 py-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">Approved so far</p>
            <p className="font-mono text-sm tabular-nums">
              <span className="font-medium text-foreground">{approved}</span>
              <span className="text-muted-foreground"> / 300 hours</span>
            </p>
          </div>
          <Progress
            value={approved}
            max={300}
            aria-label="17 of 300 required hours approved"
            className="h-1.5"
          />
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
        On paper, a supervisor signs the record. Here, every approval and
        rejection is written to a history that nobody can edit, with who
        decided and when.
      </figcaption>
    </figure>
  );
}
