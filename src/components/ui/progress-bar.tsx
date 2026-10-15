import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // raw value or 0-100 percentage
  max?: number;
  variant?: "primary" | "warning" | "destructive" | "teal" | "danger";
  color?: "primary" | "warning" | "destructive" | "teal" | "danger";
}

export function ProgressBar({
  value,
  max,
  variant = "primary",
  color,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = max ? (value / max) * 100 : value;
  const clampedValue = Math.min(100, Math.max(0, percentage));
  const activeVariant = color || variant;

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-full min-w-[88px] overflow-hidden rounded-full bg-[#E5EEFE] dark:bg-[rgba(59,130,246,0.20)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          activeVariant === "primary" && "bg-primary",
          activeVariant === "warning" && "bg-warning",
          (activeVariant === "destructive" || activeVariant === "danger") && "bg-destructive",
          activeVariant === "teal" && "bg-teal",
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

