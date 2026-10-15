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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
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
          .select(
            "id, changed_at, entry_id, changed_by, actor_role, old_values, new_values",
          )
          .in("entry_id", entryIds)
          .order("changed_at", { ascending: false });

  const approved = Number(totals?.approved_hours ?? 0);
  const pending = Number(totals?.pending_count ?? 0);
  const reachedRequired = approved >= student.required_hours;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              {student.name}
            </h1>
            <Badge variant="verified">Student</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {student.course} · {company?.name ?? "No company"} ·{" "}
            <span className="font-mono">{student.student_no}</span> ·{" "}
            {student.email}
          </p>
        </div>
        <Link
          href={`/students/${id}/report`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Generate report
        </Link>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      {/* Progress Card */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Hours progress</CardTitle>
            <Badge variant="trust">
              {Math.round((approved / student.required_hours) * 100)}% Complete
            </Badge>
          </div>
          <CardDescription>
            {pending > 0
              ? `${pending} ${pending === 1 ? "entry is" : "entries are"} waiting for a decision.`
              : "All entries have been reviewed."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          <p className="text-2xl font-medium tabular-nums text-foreground">
            {formatHours(approved)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              of {student.required_hours} hours required
            </span>
          </p>
          <Progress
            value={approved}
            max={student.required_hours}
            className="h-2"
          />

          {/* Completion certificate: only once the required hours are reached. */}
          {certificate ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="approved">Certificate issued</Badge>
              <Link
                href={`/students/${id}/certificate`}
                className={buttonVariants({ size: "sm" })}
              >
                View certificate
              </Link>
            </div>
          ) : reachedRequired ? (
            <form
              action={issueCertificate}
              className="flex flex-wrap items-center gap-3"
            >
              <input type="hidden" name="student_id" value={id} />
              <Badge variant="approved">Required hours reached</Badge>
              <Button type="submit" size="sm">
                Issue certificate
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              A completion certificate can be issued once the approved hours
              reach {student.required_hours}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time entries</CardTitle>
              <CardDescription>
                Approve or reject student-logged hours. You can change a
                decision later; every change is logged below.
              </CardDescription>
            </div>
            {pending > 0 && <Badge variant="pending">{pending} pending</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!entries || entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              This student has not logged any hours yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>In</TableHead>
                  <TableHead>Out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs tabular-nums text-foreground">
                      {e.work_date}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {shortTime(e.time_in)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {shortTime(e.time_out)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium tabular-nums text-foreground">
                      {formatHours(hoursBetween(e.time_in, e.time_out))} hrs
                    </TableCell>
                    <TableCell>
                      {e.status === "approved" ? (
                        <Badge variant="approved">Approved</Badge>
                      ) : e.status === "pending" ? (
                        <Badge variant="pending">Pending</Badge>
                      ) : e.status === "rejected" ? (
                        <Badge variant="rejected">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">{e.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={decideEntry} className="inline-flex gap-2">
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
                            variant="secondary"
                            name="decision"
                            value="rejected"
                          >
                            Reject
                          </Button>
                        )}
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
