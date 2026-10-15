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
import { averageRating, type Evaluation } from "@/lib/evaluation";
import { UUID_RE } from "@/lib/ids";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { ChangeHistory } from "./change-history";
import { decideEntry, deployStudent, issueCertificate } from "./actions";
import { AppShell } from "@/components/app-shell/app-shell";

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
    { data: evaluation },
    { data: applications },
    { data: journal },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("name, supervisor_name, employer_id")
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
    // Filled in by the student's supervisor; the coordinator only reads it.
    supabase
      .from("evaluations")
      .select("*")
      .eq("student_id", id)
      .maybeSingle(),
    // Openings this student applied for. Row Level Security returns only
    // this school's students' applications.
    supabase
      .from("applications")
      .select("id, listing_title, company_name, employer_id, status, note, created_at")
      .eq("student_id", id)
      .neq("status", "withdrawn")
      .order("created_at", { ascending: false }),
    // The student's journal. Decisions are made on the Journals page.
    supabase
      .from("journal_entries")
      .select("id, work_date, status")
      .eq("student_id", id)
      .order("work_date", { ascending: false })
      .limit(10),
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
    <AppShell
      role="coordinator"
      active="dashboard"
      title={student.name}
      description={`${student.course} · ${company?.name ?? "No company"} · ${student.student_no} · ${student.email}`}
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
      actions={
        <Link
          href={`/students/${id}/report`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Generate report
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
            aria-label="Approved hours toward the requirement"
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

      {/* Evaluation: written by the supervisor, read here. */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>OJT evaluation</CardTitle>
          <CardDescription>
            The student&apos;s supervisor fills in the school&apos;s
            evaluation form at the end of the training.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 p-5 pt-0">
          {evaluation ? (
            <>
              <Badge variant="approved">Submitted</Badge>
              <span className="text-sm text-muted-foreground">
                Average{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {averageRating(evaluation as Evaluation).toFixed(1)} / 5
                </span>
              </span>
              <Link
                href={`/evaluations/${id}`}
                className={buttonVariants({ size: "sm" })}
              >
                View evaluation
              </Link>
            </>
          ) : (
            <>
              <Badge variant="pending">Not submitted</Badge>
              <span className="text-xs text-muted-foreground">
                Waiting for the supervisor to fill in the form.
              </span>
            </>
          )}
        </CardContent>
      </Card>

      {/* Journal: read here, decided on the Journals page. */}
      {journal && journal.length > 0 && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>Journal</CardTitle>
            <CardDescription>
              The latest entries this student wrote.{" "}
              <Link href="/journal" className="underline underline-offset-4">
                Review waiting entries
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-5 pt-0">
            {journal.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="font-mono tabular-nums">{j.work_date}</span>
                <Badge
                  variant={
                    j.status === "approved"
                      ? "approved"
                      : j.status === "rejected"
                        ? "rejected"
                        : "pending"
                  }
                >
                  {j.status === "submitted"
                    ? "Waiting"
                    : j.status === "approved"
                      ? "Approved"
                      : "Needs changes"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Applications: the company decides, the coordinator deploys. */}
      {applications && applications.length > 0 && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Openings this student applied for. A company that accepts does
              not place the student: you deploy them to that company.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-5 pt-0">
            {applications.map((a) => {
              const deployed =
                a.status === "accepted" && company?.employer_id === a.employer_id;
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-border p-3"
                >
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
                  <div className="flex items-center gap-2">
                    {a.status === "sent" && (
                      <Badge variant="pending">Waiting for the company</Badge>
                    )}
                    {a.status === "declined" && (
                      <Badge variant="secondary">Declined</Badge>
                    )}
                    {a.status === "accepted" && (
                      <Badge variant="approved">
                        {deployed ? "Deployed" : "Accepted"}
                      </Badge>
                    )}
                    {a.status === "accepted" && !deployed && (
                      <form action={deployStudent}>
                        <input type="hidden" name="application_id" value={a.id} />
                        <input type="hidden" name="student_id" value={id} />
                        <Button type="submit" size="sm">
                          Deploy to {a.company_name}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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
    </AppShell>
  );
}
