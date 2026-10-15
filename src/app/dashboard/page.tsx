import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { KpiCard } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import {
  MOA_WARNING_DAYS,
  describeMoa,
  moaStatus,
  needsAttention,
} from "@/lib/moa";
import { formatHours, todayInManila } from "@/lib/time";
import { fetchAll } from "@/lib/fetch-all";
import { StudentsPanel, type StudentRow } from "./students-panel";
import { AlertCircle, Building2, Upload, Briefcase } from "lucide-react";

export const metadata = { title: "Coordinator Dashboard — Dugtong OJT" };
export const dynamic = "force-dynamic";

const ROLE_WORD: Record<string, string> = {
  coordinator: "Coordinator",
  supervisor: "Supervisor",
  student: "Student",
  system: "System",
};

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
  const { imported } = await searchParams;
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/"); // not a coordinator

  const [
    students,
    { data: companies },
    totals,
    { count: reportsWaiting },
    { count: journalWaiting },
    { data: changes },
    { data: partnershipData },
  ] = await Promise.all([
    // Every student, however many: Supabase caps one request at 1000 rows.
    fetchAll((from, to) =>
      supabase
        .from("students")
        .select("id, name, student_no, course, company_id, required_hours")
        .order("name")
        .order("id")
        .range(from, to),
    ),
    supabase.from("companies").select("id, name, moa_expires_on").order("name"),
    // Approved hours and pending counts, added up by the database.
    fetchAll((from, to) =>
      supabase
        .from("student_hours")
        .select("student_id, approved_hours, pending_count")
        .order("student_id")
        .range(from, to),
    ),
    // Misuse reports still waiting for this coordinator's decision.
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
    // Journal entries waiting for this coordinator's decision.
    supabase
      .from("journal_entries")
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
  const changeList = changes ?? [];
  const changedEntryIds = changeList.map((c) => c.entry_id);
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

  const studentOfEntry = new Map(
    (changedEntries ?? []).map((e) => [e.id, { studentId: e.student_id, date: e.work_date }]),
  );
  const nameOfStudent = new Map(studentList.map((s) => [s.id, s.name]));
  const studentCount = new Map<string, number>();
  for (const s of studentList) {
    studentCount.set(s.company_id, (studentCount.get(s.company_id) ?? 0) + 1);
  }

  const today = todayInManila();
  const moaAlerts = companyList.filter((c) =>
    needsAttention(moaStatus(c.moa_expires_on, today)),
  ).length;

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
  if (journalWaiting) {
    attention.push({
      text: `${journalWaiting} journal ${journalWaiting === 1 ? "entry is" : "entries are"} waiting for your decision.`,
      href: "/journal",
      link: "Open journals",
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
      title="Coordinator dashboard"
      description={`Student deployment, OJT hour progress and partner management for ${school.name}.`}
      user={user}
      org={{ name: school.name, verified: school.verified }}
      counts={{
        reports: reportsWaiting ?? 0,
        partnerships: partnershipRequests,
        journal: journalWaiting ?? 0,
      }}
      wide
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/companies"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Add partner
          </Link>
          <Link
            href="/roster/upload"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Upload roster
          </Link>
        </div>
      }
    >
      {imported && Number(imported) > 0 && (
        <div
          role="status"
          className="rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          ✓ Imported {Number(imported)} {Number(imported) === 1 ? "student" : "students"} successfully.
        </div>
      )}

      {/* 2-Column Main Layout: Left side content (minmax(0,1fr)), Right aside (320px) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Left Main Column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Top 4 KPI Cards: Compact, uniform height (~96px), no dead space */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Enrolled students"
              value={rows.length}
              subtext={`at ${companyList.length} partner ${companyList.length === 1 ? "company" : "companies"}`}
            />
            <KpiCard
              label="Waiting for approval"
              value={totalPending}
              subtext={
                totalPending === 0
                  ? "Nothing to decide right now"
                  : `entries from ${studentsWaiting} ${studentsWaiting === 1 ? "student" : "students"}`
              }
            />
            <KpiCard
              label="Approved hours"
              value={formatHours(totalApproved)}
              subtext={`${percentApproved}% of ${formatHours(totalRequired)} required`}
            />
            <KpiCard
              label="Completed OJT"
              value={`${completed} / ${rows.length}`}
              subtext="reached required hours"
            />
          </div>

          {/* Students Roster & Placement Table */}
          <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-medium leading-5 text-foreground">
                  Student deployment roster
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify attendance progress, review journal logs, and check company placements
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {rows.length} {rows.length === 1 ? "student" : "students"}
              </span>
            </div>
            {rows.length > 0 ? (
              <StudentsPanel rows={rows} />
            ) : (
              <div className="p-6 text-center text-sm">
                <p className="font-medium text-foreground">Your roster is empty</p>
                <p className="mt-1 text-muted-foreground">
                  Upload a CSV with each student&apos;s name, ID, course, email, company and
                  required hours. Their hours appear here once they start logging.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href="/roster/upload" className={buttonVariants({ variant: "primary", size: "sm" })}>
                    Upload your roster
                  </Link>
                  <Link href="/companies" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    {companyList.length > 0 ? "Manage companies" : "Add a company first"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Operational Subgrid (2-column): Partner Companies & Recent Decisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Partner Companies Card */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-medium leading-5 text-foreground">
                  Partner companies
                </h3>
                <Link
                  href="/companies"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Manage all
                </Link>
              </div>

              {companyList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No companies yet.{" "}
                  <Link href="/companies" className="font-medium text-primary hover:underline">
                    Add your first one
                  </Link>
                  .
                </p>
              ) : (
              <div className="divide-y divide-border text-[13px]">
                {companyList.slice(0, 6).map((c) => {
                  const status = moaStatus(c.moa_expires_on, today);
                  const n = studentCount.get(c.id) ?? 0;
                  return (
                    <div
                      key={c.id}
                      className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {c.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {n} {n === 1 ? "student" : "students"}
                        </div>
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
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {/* Decision Activity Feed Card */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
                Recent decisions
              </h3>
              <div className="divide-y divide-border text-[13px]">
                {changeList.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nothing yet. Approvals and rejections show up here.
                  </p>
                ) : (
                  changeList.slice(0, 6).map((c) => {
                    const entry = studentOfEntry.get(c.entry_id);
                    const name = entry ? nameOfStudent.get(entry.studentId) : undefined;
                    const newStatus = (c.new_values as { status?: string } | null)?.status;
                    const oldStatus = (c.old_values as { status?: string } | null)?.status;
                    const verb =
                      newStatus === "approved"
                        ? "approved"
                        : newStatus === "rejected"
                          ? "rejected"
                          : oldStatus === "rejected"
                            ? "resubmitted"
                            : "updated";
                    const actor =
                      c.changed_by === user.id
                        ? "You"
                        : (ROLE_WORD[c.actor_role ?? ""] ?? "Someone");
                    return (
                      <div key={c.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="font-medium text-foreground">
                          {actor} {verb}{" "}
                          {entry ? (
                            <Link
                              href={`/students/${entry.studentId}`}
                              className="hover:text-primary hover:underline"
                            >
                              {name ?? "a student"}
                            </Link>
                          ) : (
                            "an entry"
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {entry && <>{shiftDay(entry.date)} shift · </>}
                          {when(c.changed_at)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Aside: 320px */}
        <aside className="flex flex-col gap-6">
          {/* Needs Attention Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="size-4 text-amber-500 shrink-0" />
              <h3 className="text-[15px] font-medium leading-5 text-foreground">
                Needs attention
              </h3>
            </div>

            {attention.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                All student logs and partner MOAs are in good standing.
              </p>
            ) : (
              <div className="divide-y divide-border text-[13px]">
                {attention.map((a, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-foreground leading-snug">{a.text}</p>
                    {a.href && (
                      <Link
                        href={a.href}
                        className="inline-block mt-1 text-xs font-medium text-primary hover:underline"
                      >
                        {a.link} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
              Quick actions
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/roster/upload" className="w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-[#1D4ED8] cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  Upload student roster
                </button>
              </Link>

              <Link href="/companies" className="w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  <Building2 className="size-3.5" />
                  Add partner company
                </button>
              </Link>

              <Link href="/listings" className="w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  <Briefcase className="size-3.5" />
                  Browse OJT openings
                </button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
