import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] text-sm font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Primary solid button with professional dark blue hover
        default:
          "bg-primary text-primary-foreground hover:bg-[#1D4ED8] shadow-sm active:bg-[#1E40AF]",
        primary:
          "bg-primary text-primary-foreground hover:bg-[#1D4ED8] shadow-sm active:bg-[#1E40AF]",
        // Secondary / Outline with subtle hover tint
        outline:
          "border border-foreground/15 dark:border-muted-foreground/30 bg-card text-foreground hover:border-primary hover:text-primary hover:bg-[#F4F8FF] dark:hover:bg-[#16233F]",
        secondary:
          "border border-foreground/15 dark:border-muted-foreground/30 bg-card text-foreground hover:border-primary hover:text-primary hover:bg-[#F4F8FF] dark:hover:bg-[#16233F]",
        // Ghost button with surface hover
        ghost:
          "text-foreground hover:bg-surface active:bg-surface-hover",
        // Destructive / Danger button
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#B91C1C] active:bg-[#991B1B]",
        // Teal accent button
        teal:
          "bg-[#0EA5A5] text-white hover:bg-[#0B8A8A] active:bg-[#097373]",
        // Blue light / outline button (.bl in reference)
        blueOutline:
          "bg-card border border-primary/35 text-primary hover:bg-[#EEF4FF] dark:hover:bg-[#16233F]",
        accent:
          "bg-card border border-primary/35 text-primary hover:bg-[#EEF4FF] dark:hover:bg-[#16233F]",
        // Inline text link
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-11 px-5 text-base",
        icon: "size-9",
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
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent shrink-0"
          role="status"
          aria-label="Loading"
        />
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
