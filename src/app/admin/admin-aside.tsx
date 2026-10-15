import Link from "next/link";
import { Pill, Button } from "@/components/ui";
import { AdminEscalationSparkline, type WeeklyEscalation } from "./admin-charts";

// Everything here is pre-computed from real rows by the server page.
export type AsideEscalation = {
  id: string;
  title: string;
  detail: string;
  kind: "escalated" | "appeal";
};

export type AsideActivity = {
  id: string;
  text: string;
  when: string;
  tone: "primary" | "destructive";
};

export function AdminAside({
  escalationData,
  activeIssuesCount,
  escalations,
  activity,
}: {
  escalationData: WeeklyEscalation[];
  activeIssuesCount: number;
  escalations: AsideEscalation[];
  activity: AsideActivity[];
}) {
  const hiddenCount = Math.max(0, activeIssuesCount - escalations.length);
  const hasTrend = escalationData.some((d) => d.count > 0);

  return (
    <aside className="flex flex-col gap-6">
      {/* Escalations Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-medium leading-5 text-foreground">
            Escalations
          </h3>
          <span className="text-xs font-mono text-amber-500 font-medium">
            {activeIssuesCount} active
          </span>
        </div>

        {escalations.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No reports or appeals are waiting for you.
          </p>
        ) : (
          <div className="divide-y divide-border text-[13px]">
            {escalations.map((e) => (
              <div
                key={e.id}
                className="py-2.5 flex items-start justify-between gap-2 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{e.detail}</div>
                </div>
                <Pill variant={e.kind === "escalated" ? "escalated" : "pending"}>
                  {e.kind === "escalated" ? "Escalated" : "Appeal"}
                </Pill>
              </div>
            ))}
          </div>
        )}
        {hiddenCount > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            + {hiddenCount} more in the queue
          </p>
        )}

        {hasTrend && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Open escalations by week raised
            </div>
            <AdminEscalationSparkline
              data={escalationData}
              currentCount={activeIssuesCount}
            />
          </div>
        )}

        <Link href="/admin/escalations" className="block mt-3">
          <Button variant="blueOutline" className="w-full text-xs font-medium py-2">
            Open escalation queue
          </Button>
        </Link>
      </div>

      {/* Recent activity (real sign-ups and escalations) */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Recent activity
        </h3>
        {activity.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Nothing has happened yet.</p>
        ) : (
          <div className="divide-y divide-border text-[13px]">
            {activity.map((a) => (
              <div key={a.id} className="py-2.5 flex items-start gap-2.5 first:pt-0 last:pb-0">
                <span
                  className={`size-2 rounded-full mt-1.5 shrink-0 ${
                    a.tone === "destructive" ? "bg-destructive" : "bg-primary"
                  }`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground leading-tight">{a.text}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
