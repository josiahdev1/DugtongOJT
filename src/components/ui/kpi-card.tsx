import * as React from "react";
import { cn } from "@/lib/utils";

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtitle?: string;
  subtext?: string;
  trend?:
    | string
    | {
        direction: "up" | "down" | "neutral";
        label: string;
      };
  trendDirection?: "up" | "down" | "neutral";
}

export function KpiCard({
  label,
  value,
  subtitle,
  subtext,
  trend,
  trendDirection = "neutral",
  className,
  ...props
}: KpiCardProps) {
  const trendLabel = typeof trend === "string" ? trend : trend?.label;
  const direction =
    typeof trend === "object" && trend?.direction ? trend.direction : trendDirection;
  const descriptionText = subtitle || subtext;

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card p-4 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-all",
        className,
      )}
      {...props}
    >
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="font-heading text-[32px] font-semibold leading-8 tracking-tight text-primary font-variant-numeric tabular-nums my-1.5 dark:text-[#6C9BFF]">
        {value}
      </div>
      {trendLabel && (
        <div
          className={cn(
            "text-xs font-medium",
            direction === "up" && "text-[#087A55] dark:text-[#34D399]",
            direction === "down" && "text-destructive dark:text-[#F87171]",
            direction === "neutral" && "text-muted-foreground",
          )}
        >
          {trendLabel}
        </div>
      )}
      {!trendLabel && descriptionText && (
        <div className="text-xs text-muted-foreground">{descriptionText}</div>
      )}
    </div>
  );
}
