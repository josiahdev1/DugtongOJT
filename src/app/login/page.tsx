import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return { title: mode === "signup" ? "Create account" : "Sign in" };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error, mode } = await searchParams;
  const signingUp = mode === "signup";
  const formMode = signingUp ? "signup" : "signin";

  return (
    <AuthShell mode={formMode}>
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-foreground">
          {signingUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {signingUp
            ? "Coordinators, students, supervisors and companies all use this page."
            : "Use the email and password you signed up with."}
        </p>
      </header>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive-text">
          {error}
        </p>
      )}

      {/* key resets the form (and any old error) when switching modes */}
      <LoginForm key={formMode} mode={formMode} />

      {!signingUp && (
        <p className="text-sm leading-6 text-muted-foreground">
          Looking for a place to do your OJT?{" "}
          <Link
            href="/listings"
            className="rounded-sm font-medium text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-background"
          >
            Browse OJT openings
          </Link>
          . No account needed.
        </p>
      )}
    </AuthShell>
  );
}
