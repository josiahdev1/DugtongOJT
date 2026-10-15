"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { authenticate } from "./actions";

// The mode now comes from the page (the URL), so the heading, the layout and
// the button always agree. Switching modes is a link, not hidden state.
export function LoginForm({ mode }: { mode: "signin" | "signup" }) {
  const [state, formAction, pending] = useActionState(authenticate, undefined);
  const signup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="intent" value={mode} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-11 border-input text-base"
        />
        {signup && (
          <p className="mt-1 text-xs leading-4 text-muted-foreground">
            Students and supervisors: use the email your school or coordinator
            has on file, or you will not be matched.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? MIN_PASSWORD_LENGTH : undefined}
          required
          aria-describedby={state?.error ? "form-error" : undefined}
          error={Boolean(state?.error)}
          className={
            state?.error ? "h-11 text-base" : "h-11 border-input text-base"
          }
        />
        {state?.error ? (
          <p
            id="form-error"
            role="alert"
            className="mt-1 text-sm font-medium text-destructive-text"
          >
            {state.error}
          </p>
        ) : signup ? (
          <p className="mt-1 text-xs leading-4 text-muted-foreground">
            At least {MIN_PASSWORD_LENGTH} characters. Avoid common passwords.
          </p>
        ) : null}
      </div>

      {state?.message && (
        <p
          role="status"
          className="rounded-lg bg-teal-bg p-3 text-sm leading-6 text-teal-text"
        >
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full text-base"
      >
        {pending
          ? "Please wait…"
          : signup
            ? "Create account"
            : "Sign in"}
      </Button>

      {signup && (
        <p className="text-xs leading-5 text-muted-foreground">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of Use
          </Link>{" "}
          and have read the{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Notice
          </Link>
          .
        </p>
      )}

      <p className="pt-1 text-sm text-muted-foreground">
        {signup ? "Already have an account? " : "New here? "}
        <Link
          href={signup ? "/login" : "/login?mode=signup"}
          className="rounded-sm font-medium text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-background"
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
