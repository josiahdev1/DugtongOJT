import * as React from "react";
import { cn } from "@/lib/utils";

// A plain browser dropdown, styled to match Input. Works without any
// JavaScript, and is the same on phones as on laptops.
export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-base md:text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
