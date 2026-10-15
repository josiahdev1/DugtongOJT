import Link from "next/link";
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
  );
}
