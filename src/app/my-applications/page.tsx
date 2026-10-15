import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { MAX_WAITING_APPLICATIONS, type MyApplication } from "@/lib/applications";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { ApplicationClient } from "./application-client";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) redirect("/dashboard");

  const student = await findStudent(supabase);
  if (!student) redirect("/");

  // Row Level Security returns only this student's own applications.
  const { data } = await supabase
    .from("applications")
    .select("id, listing_id, listing_title, company_name, note, status, created_at")
    .order("created_at", { ascending: false });
  const applications = (data ?? []) as MyApplication[];
  const waiting = applications.filter((a) => a.status === "sent").length;

  return (
    <AppShell
      role="student"
      active="applications"
      title="My applications"
      description={`${waiting} of ${MAX_WAITING_APPLICATIONS} waiting. A company answers each one; your coordinator places you if it is accepted.`}
      user={user}
      actions={
        <Link href="/listings" className={buttonVariants({ size: "sm" })}>
          Browse openings
        </Link>
      }
    >
      {error && (
        <div
          role="alert"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          {message}
        </div>
      )}

      <ApplicationClient applications={applications} />
    </AppShell>
  );
}
