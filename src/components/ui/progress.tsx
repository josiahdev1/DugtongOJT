import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorColor?: string;
}

export function Progress({
  className,
  value = 0,
  max = 100,
  indicatorColor,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-trust-bg",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 rounded-full transition-all duration-300",
          indicatorColor || "bg-primary",
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}

