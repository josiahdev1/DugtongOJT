import * as React from "react";
import { Pill } from "./pill";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";

export interface StudentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  studentNumber: string; // e.g. 'OJT-2026-00125'
  fullName: string;
  course: string;        // 'BSIT' | 'BSHRM' | 'BSCS'
  companyName?: string;
  completedHours: number;
  requiredHours: number;
  status: "deployed" | "pending" | "completed" | "disputed";
  onActionClick?: () => void;
}

export function StudentCard({
  studentNumber,
  fullName,
  course,
  companyName,
  completedHours,
  requiredHours,
  status,
  className,
  ...props
}: StudentCardProps) {
  const percentage = Math.round((completedHours / (requiredHours || 1)) * 100);

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card p-4 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-all",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-semibold text-foreground tracking-tight">{fullName}</h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{course}</span>
            <span>·</span>
            <span className="font-mono">{studentNumber}</span>
          </div>
        </div>

        <Pill
          variant={
            status === "deployed"
              ? "approved"
              : status === "completed"
              ? "verified"
              : status === "disputed"
              ? "escalated"
              : "pending"
          }
        >
          {status === "deployed"
            ? "On track"
            : status === "completed"
            ? "Completed"
            : status === "disputed"
            ? "Disputed"
            : "Pending"}
        </Pill>
      </div>

      {companyName && (
        <div className="mt-2 text-xs text-muted-foreground">
          Placed at: <span className="font-medium text-foreground">{companyName}</span>
        </div>
      )}

      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono font-medium text-foreground">
            {completedHours} / {requiredHours} hrs ({percentage}%)
          </span>
        </div>
        <ProgressBar
          value={percentage}
          variant={percentage < 30 ? "warning" : "primary"}
        />
      </div>
    </div>
  );
}

