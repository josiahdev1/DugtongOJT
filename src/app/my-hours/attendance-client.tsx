"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Pill, ProgressBar } from "@/components/ui";
import { buttonVariants } from "@/components/ui/button";
import { formatHours, shortTime } from "@/lib/time";
import { LogForm } from "./log-form";

export type EntryRow = {
  id: string;
  workDate: string;
  timeIn: string;
  timeOut: string;
  status: string;
  hours: number;
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function dayLabel(workDate: string) {
  return new Date(`${workDate}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function AttendanceClient({
  companyName,
  approvedHours,
  pendingHours,
  requiredHours,
  entries,
  hasCertificate,
  today,
  earliest,
  maxDaysBack,
}: {
  companyName: string;
  approvedHours: number;
  pendingHours: number;
  requiredHours: number;
  entries: EntryRow[];
  hasCertificate: boolean;
  today: string;
  earliest: string;
  maxDaysBack: number;
}) {
  // Live clock (Manila time). Empty until mounted to avoid a hydration mismatch.
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Manila",
        }),
      );
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingHours = Math.max(0, requiredHours - approvedHours);
  const remainingDays = Math.ceil(remainingHours / 8);
  const percent =
    requiredHours > 0 ? Math.round((approvedHours / requiredHours) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      {/* Clock card */}
      <div className="rounded-[12px] border border-border bg-card p-5 text-center shadow-sm">
        <div className="text-xs text-muted-foreground font-medium">
          {dayLabel(today)}
        </div>
        <div
          className="my-2 font-mono text-[40px] font-semibold tracking-tight text-foreground tabular-nums"
          suppressHydrationWarning
        >
          {currentTime || "--:--:--"}
        </div>
        <div className="text-xs text-muted-foreground">{companyName}</div>
      </div>

      {/* Log a day */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground">
          Log a day
        </h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">
          Record your shift for today or up to {maxDaysBack} days back.
        </p>
        <LogForm today={today} earliest={earliest} />
      </div>

      {/* Entries */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Your entries
        </h3>
        {entries.length === 0 ? (
          <EmptyState
            title="Nothing logged yet"
            description="Submit your first entry above."
            className="p-4"
          />
        ) : (
          <div className="divide-y divide-border text-[13px]">
            {entries.map((r) => (
              <div
                key={r.id}
                className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {dayLabel(r.workDate)}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {shortTime(r.timeIn)} – {shortTime(r.timeOut)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-foreground font-medium">
                      {formatHours(r.hours)} hrs
                    </span>
                    <Pill
                      variant={
                        r.status === "approved" ||
                        r.status === "pending" ||
                        r.status === "rejected"
                          ? r.status
                          : "neutral"
                      }
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Pill>
                  </div>
                  {r.status === "rejected" && (
                    <span className="text-[11px] text-muted-foreground">
                      Resubmit via log form
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total progress */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">
            Approved progress ({percent}%)
          </span>
          <span className="font-mono text-foreground font-medium">
            {formatHours(approvedHours)} / {requiredHours} hrs
          </span>
        </div>
        <ProgressBar
          aria-label="Approved hours toward your requirement"
          value={approvedHours}
          max={requiredHours}
          color="primary"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          {remainingHours > 0
            ? `${formatHours(remainingHours)} hrs left · about ${remainingDays} working days`
            : "Requirement complete"}
          {pendingHours > 0 &&
            ` · +${formatHours(pendingHours)} hrs pending approval`}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Only hours your coordinator has approved count toward your requirement.
        </p>
      </div>

      {hasCertificate && (
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Your certificate
            </div>
            <Pill variant="approved" className="mt-1">
              Certificate issued
            </Pill>
          </div>
          <Link
            href="/my-hours/certificate"
            className={buttonVariants({ size: "sm" })}
          >
            View certificate
          </Link>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Something wrong at your placement?{" "}
        <Link
          href="/report"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Report a problem
        </Link>
        .
      </p>
    </div>
  );
}
