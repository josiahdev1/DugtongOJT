import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { STATUS_LABEL } from "@/lib/status";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { ChangeHistory } from "./change-history";
import { decideEntry, issueCertificate } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");
  if (!UUID_RE.test(id)) notFound();

  // Row Level Security returns this row only if the student belongs to the
  // coordinator's own school. Anyone else's student looks like "not found".
  const { data: student } = await supabase
    .from("students")
    .select("id, name, student_no, course, email, company_id, required_hours")
    .eq("id", id)
    .maybeSingle();
  if (!student) notFound();

  const [
    { data: company },
    { data: entries },
    { data: totals },
    { data: certificate },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("name, supervisor_name")
      .eq("id", student.company_id)
      .maybeSingle(),
    supabase
      .from("time_entries")
      .select("id, work_date, time_in, time_out, status")
      .eq("student_id", id)
      .order("work_date", { ascending: false }),
    // Added up by the database, not by this page.
    supabase
      .from("student_hours")
      .select("approved_hours, pending_count")
      .eq("student_id", id)
      .maybeSingle(),
    supabase
      .from("certificates")
      .select("id")
      .eq("student_id", id)
      .maybeSingle(),
  ]);

  const entryIds = (entries ?? []).map((e) => e.id);
  const dateOf = new Map((entries ?? []).map((e) => [e.id, e.work_date]));
  const { data: changes } =
    entryIds.length === 0
      ? { data: [] }
      : await supabase
          .from("time_entry_changes")
          .select("id, changed_at, entry_id, changed_by, old_values, new_values")
          .in("entry_id", entryIds)
          .order("changed_at", { ascending: false });

  const approved = Number(totals?.approved_hours ?? 0);
  const pending = Number(totals?.pending_count ?? 0);
  const reachedRequired = approved >= student.required_hours;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/dashboard"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {student.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {student.course} · {company?.name ?? "No company"} ·{" "}
            <span className="font-mono text-xs">{student.student_no}</span> ·{" "}
            {student.email}
          </p>
        </div>
        <Link
          href={`/students/${id}/report`}
          className={buttonVariants({ variant: "outline" })}
        >
          Generate report
        </Link>
      </header>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approved hours</CardTitle>
          <CardDescription>
            {pending > 0
              ? `${pending} ${pending === 1 ? "entry is" : "entries are"} waiting for your decision.`
              : "Nothing is waiting for your decision."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-2xl font-semibold tabular-nums">
            {formatHours(approved)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              of {student.required_hours} hours
            </span>
          </p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary"
            value={Math.min(approved, student.required_hours)}
            max={student.required_hours}
            aria-label="Approved hours progress"
          />

          {certificate ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">✓ Completion certificate issued.</p>
              <Link
                href={`/students/${id}/certificate`}
                className={buttonVariants({ size: "sm" })}
              >
                View certificate
              </Link>
            </div>
          ) : reachedRequired ? (
            <form action={issueCertificate} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="student_id" value={id} />
              <p className="text-sm">Required hours reached.</p>
              <Button type="submit" size="sm">
                Issue certificate
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              A completion certificate can be issued once the approved hours
              reach {student.required_hours}.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time entries</CardTitle>
          <CardDescription>
            Approve or reject each day. You can change a decision later; every
            change is logged below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This student has not logged any hours yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">{e.work_date}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_in)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_out)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(hoursBetween(e.time_in, e.time_out))}
                      </td>
                      <td className="px-3 py-2">
                        {STATUS_LABEL[e.status] ?? e.status}
                      </td>
                      <td className="px-3 py-2">
                        <form action={decideEntry} className="flex gap-2">
                          <input type="hidden" name="entry_id" value={e.id} />
                          <input type="hidden" name="student_id" value={id} />
                          {e.status !== "approved" && (
                            <Button
                              type="submit"
                              size="sm"
                              name="decision"
                              value="approved"
                            >
                              Approve
                            </Button>
                          )}
                          {e.status !== "rejected" && (
                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                              name="decision"
                              value="rejected"
                            >
                              Reject
                            </Button>
                          )}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ChangeHistory
        changes={changes ?? []}
        dateOf={dateOf}
        userId={user.id}
      />
    </main>
  );
}
