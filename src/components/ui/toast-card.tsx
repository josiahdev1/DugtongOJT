import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  message?: string;
  accent?: string;
  variant?: "primary" | "success" | "warning" | "destructive";
  icon?: React.ReactNode;
}

export function ToastCard({
  title,
  description,
  message,
  accent,
  variant = "primary",
  icon,
  className,
  style,
  ...props
}: ToastCardProps) {
  const desc = description || message;
  const customStyle = accent ? { borderLeftColor: accent, ...style } : style;

  return (
    <div
      role="status"
      style={customStyle}
      className={cn(
        "flex gap-2.5 rounded-[10px] border border-border bg-card p-3 sm:px-3.5 text-[13px] leading-5 text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] border-l-[3px]",
        !accent && variant === "primary" && "border-l-primary",
        !accent && variant === "success" && "border-l-success",
        !accent && variant === "warning" && "border-l-warning",
        !accent && variant === "destructive" && "border-l-destructive",
        className,
      )}
      {...props}
    >
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        {desc && (
          <div className="text-muted-foreground mt-0.5">{desc}</div>
        )}
      </div>
    </div>
  );
}

