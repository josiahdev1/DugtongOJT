"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RatingSegmentProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function RatingSegment({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  disabled = false,
  className,
}: RatingSegmentProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-1",
        className,
      )}
    >
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1 shrink-0" role="radiogroup" aria-label={label}>
        {options.map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={cn(
                "size-[30px] rounded-[8px] border text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:opacity-45 disabled:cursor-not-allowed",
                isSelected
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-card border-foreground/15 dark:border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

