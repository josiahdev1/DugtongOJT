"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function PendingButton({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Inside a <form action={...}> the whole form is "pending" while the
  // server works. Every submit button then disables itself (so nobody
  // double-clicks), and the button that was actually pressed shows the
  // spinner. Outside a form this does nothing.
  const { pending, data } = useFormStatus();
  const submits = props.type !== "button" && props.type !== "reset";
  const submitting = submits && pending;
  const pressed =
    submitting &&
    (!props.name || data?.get(props.name) === String(props.value ?? ""));
  const busy = loading || pressed;

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading || submitting}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy && (
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
