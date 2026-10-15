import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
        <header>
          <h1 className="text-3xl text-foreground">
            {signingUp ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Coordinators, students, supervisors and companies all use this
            page. What you see after signing in depends on who you are.
          </p>
        </header>

        <Card>
          <CardHeader className="sr-only">
            <CardTitle>{signingUp ? "Create account" : "Sign in"}</CardTitle>
            <CardDescription>Use your email and a password.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5">
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive-text">
                {error}
              </p>
            )}
            <LoginForm initialMode={signingUp ? "signup" : "signin"} />
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Looking for a place to do your OJT?{" "}
          <Link
            href="/listings"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Browse OJT openings
          </Link>
          . No account needed.
        </p>
      </main>
    </div>
  );
}
