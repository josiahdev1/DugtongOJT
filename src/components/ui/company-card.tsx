import * as React from "react";
import { Pill } from "./pill";
import { cn } from "@/lib/utils";

export interface CompanyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  industry: string;
  location: string;
  trustScore: number;
  documentsCount: number;
  documentsRequired?: number;
  isVerified: boolean;
  onActionClick?: () => void;
  actionLabel?: string;
}

export function CompanyCard({
  name,
  industry,
  location,
  trustScore,
  documentsCount,
  documentsRequired = 3,
  isVerified,
  onActionClick,
  actionLabel,
  className,
  ...props
}: CompanyCardProps) {
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
          <h4 className="text-[15px] font-semibold text-foreground tracking-tight">{name}</h4>
          <div className="text-xs text-muted-foreground mt-0.5">
            {industry} · {location}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Pill variant="trust">Trust {trustScore}</Pill>
          <Pill variant={isVerified ? "verified" : "pending"}>
            {isVerified ? "Verified" : "Pending"}
          </Pill>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">
          Compliance docs: <b className="font-mono text-foreground">{documentsCount} / {documentsRequired}</b>
        </span>

        {actionLabel && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

