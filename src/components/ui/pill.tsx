import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        verified:
          "bg-[#DDF4F4] text-[#0A7C7C] dark:bg-[rgba(14,165,165,0.18)] dark:text-[#3CCFCF]",
        pending:
          "bg-[#FEF3D7] text-[#8F5A06] dark:bg-[rgba(245,158,11,0.16)] dark:text-[#F5B74A]",
        approved:
          "bg-[#D9F5EA] text-[#087A55] dark:bg-[rgba(16,185,129,0.16)] dark:text-[#34D399]",
        rejected:
          "bg-[#FDE4E4] text-[#B31B1B] dark:bg-[rgba(220,38,38,0.18)] dark:text-[#F87171]",
        escalated:
          "bg-[#7F1D1D] text-[#FFFFFF] font-semibold",
        trust:
          "bg-[#E5EEFE] text-[#1D4ED8] font-mono font-medium dark:bg-[rgba(59,130,246,0.18)] dark:text-[#8DB4FF]",
        neutral:
          "bg-surface text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  icon?: React.ReactNode;
}

export function Pill({ className, variant, icon, children, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export { pillVariants };

