import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, type, error, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[8px] border bg-background px-3 py-1.5 text-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive text-destructive focus-visible:ring-destructive"
          : "border-input border-[rgba(15,23,42,0.14)] focus-visible:border-primary",
        className,
      )}
      {...props}
    />
  );
}
