import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "./login/actions";

export const dynamic = "force-dynamic";

// The front door decides where each person goes:
//   signed out            -> /login
//   coordinator           -> /dashboard
//   on a roster           -> /my-hours
//   anyone else           -> "you are not on a roster"
export default async function Home() {
  const { supabase, user, school } = await getCurrentUser();

  if (!user) redirect("/login");
  if (school) redirect("/dashboard");

  // Row Level Security returns a roster row only if it belongs to this
  // user's verified email. No row means they are not on any roster.
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (student) redirect("/my-hours");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>You are not on a roster</CardTitle>
          <CardDescription>
            Signed in as {user.email}. Your school&apos;s OJT coordinator adds
            students by email. Ask them to add this address, then sign in
            again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Are you an OJT coordinator instead?
          </p>
          <Link
            href="/setup-school"
            className={buttonVariants({ variant: "outline" })}
          >
            Set up my school
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
