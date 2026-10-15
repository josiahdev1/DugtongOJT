"use client";

import Link from "next/link";
import { Pill, Button } from "@/components/ui";
import { AdminEscalationSparkline, type WeeklyEscalation } from "./admin-charts";

export function AdminAside({
  escalationData,
  activeIssuesCount,
}: {
  escalationData: WeeklyEscalation[];
  activeIssuesCount: number;
}) {
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

        <div className="divide-y divide-border text-[13px]">
          <div className="py-2.5 flex items-start justify-between gap-2 first:pt-0">
            <div>
              <div className="font-medium text-foreground">Hours dispute</div>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">
                OJT-2026-00158 · 4 days
              </div>
            </div>
            <Pill variant="escalated">Escalated</Pill>
          </div>

          <div className="py-2.5 flex items-start justify-between gap-2">
            <div>
              <div className="font-medium text-foreground">Company unresponsive</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                TechAdvance PH · 3 days
              </div>
            </div>
            <Pill variant="escalated">Escalated</Pill>
          </div>

          <div className="py-2.5 flex items-start justify-between gap-2">
            <div>
              <div className="font-medium text-foreground">MOA wording query</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                WVSU · 1 day
              </div>
            </div>
            <Pill variant="pending">Open</Pill>
          </div>
        </div>

        {/* 12-Week Sparkline embedded cleanly in the card */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1 font-medium">
            12-week resolution trend
          </div>
          <AdminEscalationSparkline
            data={escalationData}
            currentCount={activeIssuesCount}
          />
        </div>

        <Link href="/admin/escalations" className="block mt-3">
          <Button variant="blueOutline" className="w-full text-xs font-medium py-2">
            Open escalation queue
          </Button>
        </Link>
      </div>

      {/* Audit Log Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Audit log
        </h3>
        <div className="divide-y divide-border text-[13px]">
          <div className="py-2.5 flex items-start gap-2.5 first:pt-0">
            <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground leading-tight">
                Admin verified BPO Hub Manila
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                12 min ago
              </div>
            </div>
          </div>

          <div className="py-2.5 flex items-start gap-2.5">
            <span className="size-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground leading-tight">
                Rejected 1 document (blurred seal)
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                1 hr ago
              </div>
            </div>
          </div>

          <div className="py-2.5 flex items-start gap-2.5">
            <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground leading-tight">
                New institution registered: ISAT U
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Yesterday
              </div>
            </div>
          </div>

          <div className="py-2.5 flex items-start gap-2.5 last:pb-0">
            <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground leading-tight">
                Partner trust scores recalculated
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Yesterday
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

