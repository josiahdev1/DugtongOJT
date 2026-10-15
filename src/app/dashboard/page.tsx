import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import {
  MOA_WARNING_DAYS,
  describeMoa,
  moaStatus,
  needsAttention,
} from "@/lib/moa";
import { formatHours, todayInManila } from "@/lib/time";
import { StudentsPanel, type StudentRow } from "./students-panel";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const ROLE_WORD: Record<string, string> = {
  coordinator: "Coordinator",
  supervisor: "Supervisor",
  student: "Student",
  system: "System",
};

// "2026-10-13" -> "Oct 13"
function shiftDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
    { data: changes },
    { data: partnershipData },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, student_no, course, company_id, required_hours")
      .order("name"),
    supabase.from("companies").select("id, name, moa_expires_on").order("name"),
    // Approved hours and pending counts, added up by the database.
    supabase
      .from("student_hours")
      .select("student_id, approved_hours, pending_count"),
    // Misuse reports still waiting for this coordinator's decision.
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
    // The latest decisions on anyone's hours at this school.
    supabase
      .from("time_entry_changes")
      .select("id, changed_at, entry_id, changed_by, actor_role, old_values, new_values")
      .order("changed_at", { ascending: false })
      .limit(8),
    supabase.rpc("school_partnerships"),
  ]);

  // Names for the activity feed: change -> entry -> student.
  const changedEntryIds = (changes ?? []).map((c) => c.entry_id);
  const { data: changedEntries } =
    changedEntryIds.length === 0
      ? { data: [] }
      : await supabase
          .from("time_entries")
          .select("id, student_id, work_date")
          .in("id", changedEntryIds);

  const studentList = students ?? [];
  const companyList = companies ?? [];
  const companyName = new Map(companyList.map((c) => [c.id, c.name]));
  const hoursOf = new Map(
    (totals ?? []).map((t) => [
      t.student_id,
      { approved: Number(t.approved_hours), pending: Number(t.pending_count) },
    ]),
  );

  const rows: StudentRow[] = studentList.map((s) => ({
    id: s.id,
    name: s.name,
    studentNo: s.student_no,
    course: s.course,
    company: companyName.get(s.company_id) ?? "—",
    approved: hoursOf.get(s.id)?.approved ?? 0,
    required: s.required_hours,
    pending: hoursOf.get(s.id)?.pending ?? 0,
  }));

  const totalPending = rows.reduce((sum, r) => sum + r.pending, 0);
  const studentsWaiting = rows.filter((r) => r.pending > 0).length;
  const totalApproved = rows.reduce((sum, r) => sum + r.approved, 0);
  const totalRequired = rows.reduce((sum, r) => sum + r.required, 0);
  const completed = rows.filter((r) => r.approved >= r.required).length;
  const percentApproved =
    totalRequired > 0 ? Math.min(100, Math.round((totalApproved / totalRequired) * 100)) : 0;

  const partnershipRequests = (
    (partnershipData ?? []) as { status: string; requested_by: string | null }[]
  ).filter((p) => p.status === "requested" && p.requested_by === "employer").length;

  const today = todayInManila();
  const moaAlerts = companyList.filter((c) =>
    needsAttention(moaStatus(c.moa_expires_on, today)),
  ).length;

  const studentOfEntry = new Map(
    (changedEntries ?? []).map((e) => [e.id, { studentId: e.student_id, date: e.work_date }]),
  );
  const nameOfStudent = new Map(studentList.map((s) => [s.id, s.name]));
  const studentCount = new Map<string, number>();
  for (const s of studentList) {
    studentCount.set(s.company_id, (studentCount.get(s.company_id) ?? 0) + 1);
  }

  // Things that need this coordinator, each with where to go.
  const attention: { text: string; href?: string; link?: string }[] = [];
  if (!school.verified) {
    attention.push({
      text: "Your school is waiting for verification. You can add companies and upload your roster now, but students cannot sign in until the Dugtong team verifies it.",
    });
  }
  if (reportsWaiting) {
    attention.push({
      text: `${reportsWaiting} misuse ${reportsWaiting === 1 ? "report is" : "reports are"} waiting for your decision.`,
      href: "/reports",
      link: "Open reports",
    });
  }
  if (partnershipRequests > 0) {
    attention.push({
      text: `${partnershipRequests} ${partnershipRequests === 1 ? "company wants" : "companies want"} to partner with your school.`,
      href: "/partnerships",
      link: "Review requests",
    });
  }
  if (moaAlerts > 0) {
    attention.push({
      text: `${moaAlerts} ${moaAlerts === 1 ? "MOA is" : "MOAs are"} expired or expiring within ${MOA_WARNING_DAYS} days.`,
      href: "/companies",
      link: "Review companies",
    });
  }

  return (
    <AppShell
      role="coordinator"
      active="dashboard"
      title="Dashboard"
      description={`Approvals, progress and activity for ${school.name}.`}
      user={user}
      org={{ name: school.name, verified: school.verified }}
      counts={{ reports: reportsWaiting ?? 0, partnerships: partnershipRequests }}
      wide
      actions={
        <>
          <Link href="/companies" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Add company
          </Link>
          <Link href="/roster/upload" className={buttonVariants({ size: "sm" })}>
            Upload roster
          </Link>
        </>
      }
    >
      {attention.length > 0 && (
        <section
          aria-label="Needs your attention"
          className="rounded-[8px] border border-warning/30 bg-warning-bg"
        >
          <h2 className="px-4 pt-3 font-sans text-sm font-medium tracking-normal text-warning-text">
            Needs your attention
          </h2>
          <ul className="divide-y divide-warning/20">
            {attention.map((a) => (
              <li
                key={a.text}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm text-warning-text"
              >
                <span>{a.text}</span>
                {a.href && (
                  <Link href={a.href} className="shrink-0 font-medium underline underline-offset-4">
                    {a.link}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {imported && Number(imported) > 0 && (
        <div
          role="status"
          className="rounded-[8px] border border-success/30 bg-success-bg p-3 text-sm font-medium text-success-text"
        >
          ✓ Imported {Number(imported)} {Number(imported) === 1 ? "student" : "students"}.
        </div>
      )}

      {/* The four numbers a coordinator checks first. */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription>Students</CardDescription>
            <CardTitle className="font-heading text-3xl font-medium tabular-nums">
              {rows.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            at {companyList.length} partner {companyList.length === 1 ? "company" : "companies"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription>Waiting for approval</CardDescription>
            <CardTitle
              className={`font-heading text-3xl font-medium tabular-nums ${totalPending > 0 ? "text-warning-text" : ""}`}
            >
              {totalPending}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {totalPending === 0
              ? "Nothing to decide right now"
              : `entries from ${studentsWaiting} ${studentsWaiting === 1 ? "student" : "students"}`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription>Approved hours</CardDescription>
            <CardTitle className="font-heading text-3xl font-medium tabular-nums">
              {formatHours(totalApproved)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-4 pt-0">
            <Progress value={totalApproved} max={Math.max(totalRequired, 1)} aria-label="Share of all required hours approved" />
            <span className="text-xs text-muted-foreground">
              {percentApproved}% of {totalRequired} required
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription>Completed OJT</CardDescription>
            <CardTitle className="font-heading text-3xl font-medium tabular-nums">
              {completed}
              <span className="text-base font-normal text-muted-foreground"> of {rows.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            reached their required hours
          </CardContent>
        </Card>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Students */}
        <Card className="min-w-0">
          <CardHeader className="p-5 pb-3">
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {rows.length > 0
                ? "Open a student to approve their hours, or search the roster."
                : "Your roster is empty."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length > 0 ? (
              <StudentsPanel rows={rows} />
            ) : (
              <ol className="flex flex-col gap-4 p-5 pt-2 text-sm">
                <li className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${companyList.length > 0 ? "bg-success-bg text-success-text" : "bg-trust-bg text-trust-text"}`}
                  >
                    {companyList.length > 0 ? "✓" : "1"}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Add a partner company</p>
                    <p className="text-muted-foreground">
                      A company you already have a signed MOA with.{" "}
                      <Link href="/companies" className="font-medium text-primary-text underline underline-offset-4">
                        Add a company
                      </Link>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trust-bg text-xs font-medium text-trust-text">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Upload your roster</p>
                    <p className="text-muted-foreground">
                      A CSV with each student&apos;s name, ID, course, email, company and required hours.{" "}
                      <Link href="/roster/upload" className="font-medium text-primary-text underline underline-offset-4">
                        Upload a roster
                      </Link>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-trust-bg text-xs font-medium text-trust-text">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Students log, you approve</p>
                    <p className="text-muted-foreground">
                      Students sign up with their roster email and log each day. Their hours appear here.
                    </p>
                  </div>
                </li>
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Side rail: what just happened, and where partners stand */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>The latest decisions on hours.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {(changes ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing yet. Approvals and rejections show up here.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {(changes ?? []).map((c) => {
                    const entry = studentOfEntry.get(c.entry_id);
                    const name = entry ? nameOfStudent.get(entry.studentId) : undefined;
                    const status = (c.new_values as { status?: string }).status;
                    const oldStatus = (c.old_values as { status?: string }).status;
                    const verb =
                      status === "approved"
                        ? "approved"
                        : status === "rejected"
                          ? "rejected"
                          : oldStatus === "rejected"
                            ? "resubmitted"
                            : "updated";
                    const actor =
                      c.changed_by === user.id
                        ? "You"
                        : (ROLE_WORD[c.actor_role ?? ""] ?? "Someone");
                    return (
                      <li key={c.id} className="text-sm leading-5">
                        <p>
                          <span className="font-medium text-foreground">{actor}</span>{" "}
                          {verb}{" "}
                          {entry ? (
                            <Link
                              href={`/students/${entry.studentId}`}
                              className="font-medium text-foreground underline-offset-4 hover:text-primary-text hover:underline"
                            >
                              {name ?? "a student"}
                            </Link>
                          ) : (
                            "an entry"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry && <>{shiftDay(entry.date)} shift · </>}
                          {when(c.changed_at)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Partner companies</CardTitle>
                <Link
                  href="/companies"
                  className="text-xs font-medium text-primary-text underline-offset-4 hover:underline"
                >
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {companyList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No companies yet.{" "}
                  <Link href="/companies" className="font-medium text-primary-text underline underline-offset-4">
                    Add your first one
                  </Link>
                  .
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {companyList.slice(0, 6).map((c) => {
                    const status = moaStatus(c.moa_expires_on, today);
                    const n = studentCount.get(c.id) ?? 0;
                    return (
                      <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {n} {n === 1 ? "student" : "students"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            status.kind === "expired"
                              ? "rejected"
                              : status.kind === "expiring"
                                ? "pending"
                                : status.kind === "valid"
                                  ? "approved"
                                  : "secondary"
                          }
                        >
                          {describeMoa(status)}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
