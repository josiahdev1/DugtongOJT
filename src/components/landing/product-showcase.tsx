import { Check, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Fictional sample data only. Nothing here is read from the database.
const REQUIRED = 486;

const NAV = ["Dashboard", "Students", "Partners", "Reports"];

const ROWS = [
  { name: "Maria Santos", course: "BSIT", approved: 312, waiting: 0 },
  { name: "Juan Dela Cruz", course: "BSIT", approved: 180, waiting: 8 },
  { name: "Ana Reyes", course: "BSIT", approved: 95, waiting: 16 },
];

const CALLOUTS = [
  {
    icon: Clock,
    title: "Live hours",
    body: "Approved hours add up as each day is signed off.",
    position: "lg:left-0 lg:top-10",
  },
  {
    icon: Check,
    title: "Scope acknowledgment",
    body: "Students confirm the tasks they agreed to.",
    position: "lg:right-0 lg:top-1/2",
  },
  {
    icon: ShieldCheck,
    title: "Company trust signals",
    body: "See a company's track record before you partner.",
    position: "lg:bottom-6 lg:left-4",
  },
];

function DashboardMock() {
  return (
    <div className="grid grid-cols-[auto_1fr]" aria-hidden="true">
      {/* Sidebar */}
      <div className="hidden w-44 flex-col gap-1 border-r border-border bg-surface p-3 sm:flex">
        <p className="mb-2 px-2 font-heading text-sm font-medium text-foreground">
          Dugtong OJT
        </p>
        {NAV.map((item, i) => (
          <div
            key={item}
            className={
              i === 0
                ? "rounded-lg border-l-2 border-primary bg-card px-2 py-1.5 text-xs font-medium text-foreground"
                : "px-2 py-1.5 text-xs text-muted-foreground"
            }
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="col-span-2 min-w-0 p-4 sm:col-span-1 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-heading text-base font-medium text-foreground">
              OJT overview
            </p>
            <p className="text-xs text-muted-foreground">
              West Visayas State University
            </p>
          </div>
          <Badge variant="verified">Verified school</Badge>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            ["Students", "24"],
            ["Waiting for approval", "3"],
            ["Completed", "2"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-3"
            >
              <p className="font-heading text-2xl font-medium tabular-nums text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1.3fr_1fr_auto] gap-3 border-b border-border bg-surface px-4 py-2 text-xs text-muted-foreground">
            <span>Student</span>
            <span>Approved hours</span>
            <span className="text-right">Status</span>
          </div>
          {ROWS.map((r) => (
            <div
              key={r.name}
              className="grid grid-cols-[1.3fr_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {r.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.course} · Iloilo IT Solutions Inc.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {r.approved} / {REQUIRED}
                </span>
                <Progress value={r.approved} max={REQUIRED} className="h-1.5" />
              </div>
              <Badge variant={r.waiting > 0 ? "pending" : "approved"}>
                {r.waiting > 0 ? `${r.waiting} hrs waiting` : "Up to date"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A browser window around a stylized coordinator dashboard, with feature
 * callouts. On large screens the callouts float over the frame's edges; on
 * smaller screens they stack underneath so nothing overflows.
 */
export function ProductShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-4xl lg:pb-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/10">
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3"
          aria-hidden="true"
        >
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto w-full max-w-xs truncate rounded-md border border-border bg-background px-3 py-1 text-center text-xs text-muted-foreground">
            dugtong.app/dashboard
          </div>
          <span className="hidden w-12 sm:block" />
        </div>
        <DashboardMock />
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-0 lg:block">
        {CALLOUTS.map(({ icon: Icon, title, body, position }) => (
          <li
            key={title}
            className={`rounded-xl border border-border bg-card p-4 shadow-sm lg:absolute lg:w-56 lg:shadow-md ${position}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-bg text-teal-text">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

