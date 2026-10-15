import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Fictional sample data only (approved in the design system). Nothing here
// is read from the database.
const KPIS = [
  { label: "Students", value: "24" },
  { label: "Waiting", value: "3" },
  { label: "Completed", value: "2" },
];

const REQUIRED = 486;

const ROWS = [
  { name: "Maria Santos", course: "BSIT", approved: 312, pending: 0 },
  { name: "Juan Dela Cruz", course: "BSIT", approved: 180, pending: 8 },
  { name: "Ana Reyes", course: "BSIT", approved: 95, pending: 16 },
];

const PHONE = {
  school: "West Visayas State University",
  student: "Maria Santos",
  course: "BS Information Technology",
  company: "Iloilo IT Solutions Inc.",
  approved: 312,
  record: "OJT-2026-00125",
};

const CIRCUMFERENCE = 283;

/**
 * Layered product picture for the hero. On large screens a coordinator
 * dashboard sits behind a student phone screen; on small screens only the
 * phone shows. Decorative, so hidden from screen readers.
 */
export function HeroMockup() {
  const pct = Math.round((PHONE.approved / REQUIRED) * 100);
  const dashOffset = CIRCUMFERENCE * (1 - PHONE.approved / REQUIRED);

  return (
    <div
      className="relative mx-auto w-full max-w-[540px] lg:h-[460px]"
      aria-hidden="true"
    >
      {/* Dashboard card: behind, large screens only */}
      <div className="absolute left-0 top-0 z-10 hidden w-[88%] rounded-2xl border border-border bg-card lg:block dark:border-primary-soft/25">
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-heading text-sm font-medium text-foreground">
              Coordinator dashboard
            </p>
            <Badge variant="secondary">West Visayas State University</Badge>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {KPIS.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <p className="font-heading text-xl font-medium tabular-nums text-foreground">
                  {k.value}
                </p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1.4fr_1fr_auto] gap-3 border-b border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
              <span>Student</span>
              <span>Approved hours</span>
              <span className="text-right">Status</span>
            </div>
            {ROWS.map((r) => (
              <div
                key={r.name}
                className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-3 border-b border-border px-3 py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.course}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs tabular-nums text-foreground">
                    {r.approved} / {REQUIRED}
                  </span>
                  <Progress value={r.approved} max={REQUIRED} className="h-1" />
                </div>
                <Badge variant={r.pending > 0 ? "pending" : "approved"}>
                  {r.pending > 0 ? `${r.pending} hrs waiting` : "Up to date"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phone: in front */}
      <div className="relative z-20 mx-auto w-[260px] max-w-full lg:absolute lg:bottom-0 lg:right-0 lg:mx-0">
        <div className="overflow-hidden rounded-[28px] border border-border bg-background dark:border-primary-soft/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <div className="relative h-3 bg-foreground/90">
            <div className="absolute left-1/2 top-1/2 h-1.5 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/30" />
          </div>

          <div className="space-y-3 p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">09:41</span>
              <span className="h-2.5 w-5 rounded-sm bg-foreground/80" />
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <p className="font-heading text-xs font-medium text-foreground">
                {PHONE.school}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {PHONE.student} · {PHONE.course}
              </p>
              <p className="text-xs text-muted-foreground">{PHONE.company}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative size-[68px] shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="9"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-heading text-sm font-medium tabular-nums text-foreground">
                    {pct}%
                  </p>
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="font-heading text-xl font-medium tabular-nums text-foreground">
                  {PHONE.approved} hrs
                </p>
                <p className="text-xs text-muted-foreground">
                  of {REQUIRED} required
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Latest record
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm tabular-nums text-foreground">
                  08:00 – 17:00
                </p>
                <Badge variant="approved">Approved</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-teal-bg p-3">
              <p className="text-xs font-medium text-teal-text">
                Scope of work acknowledged
              </p>
              <p className="font-mono text-xs tabular-nums text-teal-text">
                {PHONE.record}
              </p>
            </div>
          </div>

          <div className="flex h-4 items-center justify-center">
            <div className="h-1 w-14 rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
