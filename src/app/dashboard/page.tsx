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
import { MOA_WARNING_DAYS, moaStatus, needsAttention } from "@/lib/moa";
import { formatHours, todayInManila } from "@/lib/time";
import { signOut } from "../login/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/"); // not a coordinator

  const { imported } = await searchParams;

  const [
    { data: students },
    { data: companies },
    { data: totals },
    { count: reportsWaiting },
  ] = await Promise.all([
      supabase
        .from("students")
        .select("id, name, student_no, course, company_id, required_hours")
        .order("name"),
      supabase.from("companies").select("id, name, moa_expires_on"),
      // Approved hours and pending counts, added up by the database.
      supabase
        .from("student_hours")
        .select("student_id, approved_hours, pending_count"),
      // Misuse reports still waiting for this coordinator's decision.
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]);
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const hoursOf = new Map(
    (totals ?? []).map((t) => [
      t.student_id,
      { approved: Number(t.approved_hours), pending: Number(t.pending_count) },
    ]),
  );
  // Requests from companies that are waiting for this coordinator's answer.
  const { data: partnershipData } = await supabase.rpc("school_partnerships");
  const partnershipRequests = (
    (partnershipData ?? []) as { status: string; requested_by: string | null }[]
  ).filter((p) => p.status === "requested" && p.requested_by === "employer").length;

  // Companies whose MOA has expired or runs out within 30 days.
  const today = todayInManila();
  const moaAlerts = (companies ?? []).filter((c) =>
    needsAttention(moaStatus(c.moa_expires_on, today)),
  ).length;
  const totalPending = (totals ?? []).reduce(
    (sum, t) => sum + Number(t.pending_count),
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {school.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Coordinator · {user.email}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      {!school.verified && (
        <p
          role="status"
          className="rounded-[var(--radius)] border border-border bg-secondary p-3 text-sm"
        >
          <span className="font-medium">Waiting for verification.</span> You
          can add companies and upload your roster now, but students cannot
          sign in until the Dugtong team verifies your school.
        </p>
      )}

      {moaAlerts > 0 && (
        <p
          role="status"
          className="rounded-[var(--radius)] border border-destructive p-3 text-sm"
        >
          <span className="font-medium">
            ⚠ {moaAlerts} {moaAlerts === 1 ? "MOA needs" : "MOAs need"} attention.
          </span>{" "}
          Expired or expiring within {MOA_WARNING_DAYS} days.{" "}
          <Link
            href="/companies"
            className="font-medium underline underline-offset-4"
          >
            Review on the Companies page
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/companies" className={buttonVariants({ variant: "outline" })}>
          Add company
        </Link>
        <Link href="/roster/upload" className={buttonVariants()}>
          Upload roster
        </Link>
        <Link href="/partnerships" className={buttonVariants({ variant: "outline" })}>
          Partnerships{partnershipRequests ? ` (${partnershipRequests} waiting)` : ""}
        </Link>
        <Link href="/reports" className={buttonVariants({ variant: "outline" })}>
          Reports{reportsWaiting ? ` (${reportsWaiting} waiting)` : ""}
        </Link>
      </div>

      {imported && Number(imported) > 0 && (
        <p role="status" className="text-sm font-medium">
          ✓ Imported {Number(imported)}{" "}
          {Number(imported) === 1 ? "student" : "students"}.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            {students && students.length > 0
              ? `${students.length} on your roster · ${totalPending} ${totalPending === 1 ? "entry" : "entries"} waiting for approval.`
              : "No students yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a partner company, then upload a roster. Your students will
              appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Student ID</th>
                    <th className="px-3 py-2 font-medium">Course</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Approved / required
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Pending
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <Link
                          href={`/students/${s.id}`}
                          className="font-medium underline underline-offset-4"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {s.student_no}
                      </td>
                      <td className="px-3 py-2">{s.course}</td>
                      <td className="px-3 py-2">
                        {companyName.get(s.company_id) ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(hoursOf.get(s.id)?.approved ?? 0)} /{" "}
                        {s.required_hours}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {hoursOf.get(s.id)?.pending ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
