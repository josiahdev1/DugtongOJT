"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export function DatePicker({
  label,
  error,
  className,
  id,
  ...props
}: DatePickerProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          type="date"
          className={cn(
            "w-full rounded-[8px] border border-foreground/15 dark:border-muted-foreground/30 bg-card px-3 py-2 text-sm text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-45 disabled:cursor-not-allowed",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
        <Calendar className="pointer-events-none absolute right-3 size-4 text-muted-foreground" />
      </div>

      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </div>
  );
}

