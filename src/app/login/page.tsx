import { redirect } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

// Ticket 02 check: ask Supabase how many schools we are allowed to see.
// Signed-out visitors should see 0 — Row Level Security hides every row
// from them. That is a pass: the connection works AND the table is locked.
async function checkSupabase() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("schools")
      .select("id", { count: "exact", head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Connected to Supabase (schools visible: ${count ?? 0})` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const status = await checkSupabase();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <header className="flex flex-col gap-4">
        <div>
          <Image
            src="/dugtong-ojt-logo.png"
            alt="Dugtong OJT"
            width={260}
            height={70}
            priority
            className="dugtong-logo-light h-auto w-52"
          />
          <Image
            src="/dugtong-ojt-logo-dark.png"
            alt=""
            width={260}
            height={70}
            className="dugtong-logo-dark h-auto w-52"
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Track OJT hours without the paperwork.
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Coordinators and students use the same page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <LoginForm />
        </CardContent>
      </Card>

      <p
        className={
          status.ok
            ? "text-xs text-muted-foreground"
            : "text-xs font-medium text-destructive"
        }
      >
        {status.ok ? "✓ " : "✗ "}
        {status.message}
      </p>
    </main>
  );
}
