import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-3 text-primary-soft">{icon}</div>
      ) : (
        <svg
          className="mb-3 size-12 stroke-primary-soft"
          style={{ strokeWidth: 1.3, fill: "none" }}
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <rect x="10" y="14" width="44" height="36" rx="6" />
          <path d="M10 26h44M20 36h14M20 42h8" />
          <circle cx="46" cy="40" r="6" />
          <path d="M50.5 44.5L56 50" />
        </svg>
      )}

      <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
      {description && (
        <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

