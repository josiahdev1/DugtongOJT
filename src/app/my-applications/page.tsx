import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  APPLICATION_STATUS_LABEL,
  MAX_WAITING_APPLICATIONS,
  type MyApplication,
} from "@/lib/applications";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { withdrawApplication } from "./actions";

export const dynamic = "force-dynamic";

const BADGE: Record<string, "pending" | "approved" | "rejected" | "secondary"> = {
  sent: "pending",
  accepted: "approved",
  declined: "rejected",
  withdrawn: "secondary",
};

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
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="rounded-[8px] border border-success/30 bg-success-bg p-3 text-xs font-medium text-success-text"
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Your applications</CardTitle>
          <CardDescription>
            Accepted means the company wants you. You are not placed until
            your school coordinator deploys you to that company.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have not applied for anything yet. Find an opening on the
              OJT openings page and apply.
            </p>
          ) : (
            applications.map((a) => (
              <article
                key={a.id}
                className="flex flex-col gap-2 rounded-[8px] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {a.listing_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.company_name} · applied{" "}
                      <span className="font-mono tabular-nums">
                        {a.created_at.slice(0, 10)}
                      </span>
                    </p>
                  </div>
                  <Badge variant={BADGE[a.status]}>
                    {APPLICATION_STATUS_LABEL[a.status]}
                  </Badge>
                </div>
                {a.note && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {a.note}
                  </p>
                )}
                {a.status === "sent" && (
                  <form action={withdrawApplication}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Withdraw application
                    </Button>
                  </form>
                )}
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
