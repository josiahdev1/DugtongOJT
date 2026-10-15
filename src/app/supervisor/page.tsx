import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { JOURNAL_STATUS_LABEL, type JournalEntry } from "@/lib/journal";
import { APPEAL_STATUS_LABEL, CATEGORY_LABEL } from "@/lib/reports";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { Textarea } from "@/components/ui/textarea";
import { appealReport, decideAsSupervisor } from "./actions";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  name: string;
  student_no: string;
  course: string;
  required_hours: number;
  company_id: string;
  approved_hours: number;
  pending_count: number;
};

export default async function SupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isSupervisor } = await supabase.rpc("is_supervisor");
  if (!isSupervisor) redirect("/");

  // Name, ID, course and hours of THIS supervisor's students only, without
  // emails. The database function decides who is "theirs".
  const { data: studentData } = await supabase.rpc("supervisor_students");
  const students = (studentData ?? []) as StudentRow[];
  const nameOf = new Map(students.map((s) => [s.id, s.name]));

  // Reports the school coordinator has UPHELD about this company. They never
  // include who filed them, and reports that were not upheld never appear.
  const { data: reportData } = await supabase.rpc("supervisor_upheld_reports");
  const upheldReports = (reportData ?? []) as {
    id: string;
    company_id: string;
    category: string;
    related_date: string;
    description: string;
  }[];

  // This company's appeals, with their own copy of the report (no student).
  const { data: appealData } = await supabase
    .from("report_appeals")
    .select("id, report_id, category, related_date, report_description, reason, status")
    .order("created_at", { ascending: false });
  const appeals = (appealData ?? []) as {
    id: string;
    report_id: string;
    category: string;
    related_date: string;
    report_description: string;
    reason: string;
    status: string;
  }[];
  const appealOf = new Map(appeals.map((a) => [a.report_id, a]));

  // The latest journal entries of this supervisor's students (read only:
  // only the school coordinator approves them).
  const { data: journalData } = await supabase
    .from("journal_entries")
    .select("id, student_id, work_date, body, status, review_note, updated_at")
    .order("work_date", { ascending: false })
    .limit(10);
  const journal = (journalData ?? []) as JournalEntry[];

  const [{ data: companies }, { data: pending }, { data: evaluationRows }] =
    await Promise.all([
    supabase.from("companies").select("id, name"),
    supabase
      .from("time_entries")
      .select("id, student_id, work_date, time_in, time_out")
      .eq("status", "pending")
      .order("work_date", { ascending: true }),
    // Which of these students already have an evaluation saved.
    supabase.from("evaluations").select("student_id"),
  ]);
  const evaluated = new Set((evaluationRows ?? []).map((r) => r.student_id));
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return (
    <AppShell
      role="supervisor"
      active="approvals"
      title="Approvals"
      description={`Hours your students logged at ${(companies ?? []).map((c) => c.name).join(", ") || "your company"}.`}
      user={user}
    >
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waiting for your approval</CardTitle>
          <CardDescription>
            Approve the hours your students really worked. The school
            coordinator can still change a decision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pending || pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is waiting.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Student</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        {nameOf.get(e.student_id) ?? "—"}
                      </td>
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
                        <form action={decideAsSupervisor} className="flex gap-2">
                          <input type="hidden" name="entry_id" value={e.id} />
                          <Button
                            type="submit"
                            size="sm"
                            name="decision"
                            value="approved"
                          >
                            Approve
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            name="decision"
                            value="rejected"
                          >
                            Reject
                          </Button>
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

      {journal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student journals</CardTitle>
            <CardDescription>
              The latest entries your students wrote about their days. You
              can read them; the school coordinator approves them.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {journal.map((j) => (
              <article
                key={j.id}
                className="flex flex-col gap-1 rounded-[var(--radius)] border border-border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {nameOf.get(j.student_id) ?? "A student"}{" "}
                    <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
                      {j.work_date}
                    </span>
                  </p>
                  <Badge
                    variant={
                      j.status === "approved"
                        ? "approved"
                        : j.status === "rejected"
                          ? "rejected"
                          : "pending"
                    }
                  >
                    {JOURNAL_STATUS_LABEL[j.status]}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm">{j.body}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      {upheldReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upheld reports about your company</CardTitle>
            <CardDescription>
              A school coordinator reviewed these and upheld them. They do
              not say who raised them. Please make sure the work students do
              matches the tasks agreed with the school.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upheldReports.map((r) => (
              <article
                key={r.id}
                className="flex flex-col gap-1 rounded-[var(--radius)] border border-border p-3"
              >
                <p className="text-sm font-medium">
                  {CATEGORY_LABEL[r.category] ?? r.category}{" "}
                  <span className="font-normal tabular-nums text-muted-foreground">
                    · {r.related_date} · {companyName.get(r.company_id) ?? "—"}
                  </span>
                </p>
                <p className="whitespace-pre-wrap text-sm">{r.description}</p>
                {appealOf.has(r.id) ? (
                  <div>
                    <Badge variant="pending">
                      {APPEAL_STATUS_LABEL[appealOf.get(r.id)!.status]}
                    </Badge>
                  </div>
                ) : (
                  <details className="group">
                    <summary className="w-fit cursor-pointer list-none rounded-[8px] border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Appeal this report
                    </summary>
                    <form
                      action={appealReport}
                      className="mt-3 flex flex-col gap-2"
                    >
                      <input type="hidden" name="report_id" value={r.id} />
                      <label
                        htmlFor={`reason-${r.id}`}
                        className="text-sm font-medium"
                      >
                        Why should this report not stand?
                      </label>
                      <Textarea
                        id={`reason-${r.id}`}
                        name="reason"
                        required
                        minLength={10}
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground">
                        A Dugtong admin will decide. You can appeal a report
                        once, and the decision is final.
                      </p>
                      <div>
                        <Button type="submit" size="sm">
                          Send appeal
                        </Button>
                      </div>
                    </form>
                  </details>
                )}
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      {appeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your appeals</CardTitle>
            <CardDescription>
              A Dugtong admin decides each appeal. If an appeal is granted,
              the report no longer counts against your company.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {appeals.map((a) => (
              <article
                key={a.id}
                className="flex flex-col gap-2 rounded-[var(--radius)] border border-border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {CATEGORY_LABEL[a.category] ?? a.category}{" "}
                    <span className="font-normal tabular-nums text-muted-foreground">
                      · {a.related_date}
                    </span>
                  </p>
                  <Badge
                    variant={
                      a.status === "granted"
                        ? "approved"
                        : a.status === "denied"
                          ? "rejected"
                          : "pending"
                    }
                  >
                    {APPEAL_STATUS_LABEL[a.status] ?? a.status}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.report_description}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  <span className="font-medium">Your reason: </span>
                  {a.reason}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your students</CardTitle>
          <CardDescription>
            {students.length === 0
              ? "No students are placed at your company yet."
              : `${students.length} placed at your company.`}
          </CardDescription>
        </CardHeader>
        {students.length > 0 && (
          <CardContent>
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
                    <th className="px-3 py-2 text-right font-medium">Pending</th>
                    <th className="px-3 py-2 font-medium">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {s.student_no}
                      </td>
                      <td className="px-3 py-2">{s.course}</td>
                      <td className="px-3 py-2">
                        {companyName.get(s.company_id) ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(Number(s.approved_hours))} /{" "}
                        {s.required_hours}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Number(s.pending_count)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {evaluated.has(s.id) ? (
                            <Badge variant="approved">Submitted</Badge>
                          ) : (
                            <Badge variant="pending">Not submitted</Badge>
                          )}
                          <Link
                            href={`/supervisor/evaluate/${s.id}`}
                            className={buttonVariants({
                              size: "sm",
                              variant: evaluated.has(s.id) ? "outline" : "default",
                            })}
                          >
                            {evaluated.has(s.id) ? "Edit" : "Evaluate"}
                          </Link>
                          {evaluated.has(s.id) && (
                            <Link
                              href={`/evaluations/${s.id}`}
                              className={buttonVariants({
                                size: "sm",
                                variant: "outline",
                              })}
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </AppShell>
  );
}
