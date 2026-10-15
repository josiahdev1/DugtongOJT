import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        verified:
          "bg-teal-bg text-teal-text",
        pending:
          "bg-warning-bg text-warning-text",
        approved:
          "bg-success-bg text-success-text",
        rejected:
          "bg-destructive-bg text-destructive-text",
        escalated:
          "bg-escalated-bg text-escalated-text font-semibold",
        trust:
          "bg-trust-bg text-trust-text font-mono font-medium",
        secondary:
          "bg-surface text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };

