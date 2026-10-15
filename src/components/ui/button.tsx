import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        secondary:
          "border border-border bg-background text-foreground hover:bg-surface-hover active:bg-surface-hover",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-hover active:bg-surface-hover",
        ghost:
          "text-foreground hover:bg-surface-hover active:bg-surface-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#B91C1C] active:bg-[#B91C1C]",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "border border-primary/30 text-primary bg-background hover:bg-primary/5",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent mr-1"
          role="status"
          aria-label="Loading"
        />
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
