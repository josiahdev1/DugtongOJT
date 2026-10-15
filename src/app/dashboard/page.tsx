import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { KpiCard } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import {
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

type TimeEntryChange = {
  id: string;
  changed_at: string;
  entry_id: string;
  changed_by: string;
  actor_role: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
};

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

const SEED_STUDENTS: StudentRow[] = [
  { id: "s1", name: "Maria Santos", studentNo: "2023-01042", course: "BSIT", company: "Iloilo IT Solutions Inc.", approved: 320, required: 486, pending: 2 },
  { id: "s2", name: "Kristine Lopez", studentNo: "2023-01167", course: "BSIT", company: "Iloilo IT Solutions Inc.", approved: 380, required: 486, pending: 1 },
  { id: "s3", name: "Paolo Reyes", studentNo: "2023-01089", course: "BSCS", company: "Panay Care BPO", approved: 53, required: 240, pending: 1 },
  { id: "s4", name: "Alyssa Villanueva", studentNo: "2023-01204", course: "BSBA", company: "Visayas EduTech", approved: 290, required: 300, pending: 0 },
  { id: "s5", name: "Gabriel Tan", studentNo: "2023-01315", course: "BSIT", company: "QuickServe Staffing", approved: 486, required: 486, pending: 0 },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { imported } = await searchParams;
  const { user, school: realSchool, supabase } = await getCurrentUser();

  const school = realSchool ?? {
    id: "wvsu-main",
    name: "West Visayas State University",
    verified: true,
  };
  const currentUser = user ?? { email: "coordinator@wvsu.edu.ph" };

  let rows: StudentRow[] = [];
  let companyList: { id: string; name: string; moa_expires_on: string | null }[] = [];
  let changes: TimeEntryChange[] = [];
  let partnershipRequests = 2;
  let reportsWaiting = 1;
  let journalWaiting = 3;

  if (supabase && user && realSchool) {
    try {
      const [
        students,
        companies,
        totals,
        { count: rw },
        { count: jw },
        { data: ch },
        { data: partnershipData },
      ] = await Promise.all([
        fetchAll((from, to) =>
          supabase
            .from("students")
            .select("id, name, student_no, course, company_id, required_hours")
            .eq("school_id", school.id)
            .order("name", { ascending: true })
            .range(from, to),
        ),
        fetchAll((from, to) =>
          supabase
            .from("companies")
            .select("id, name, moa_expires_on")
            .eq("school_id", school.id)
            .order("name", { ascending: true })
            .range(from, to),
        ),
        fetchAll((from, to) =>
          supabase.rpc("student_hours_totals").range(from, to),
        ),
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("journal_entries")
          .select("id", { count: "exact", head: true })
          .eq("status", "submitted"),
        supabase
          .from("time_entry_changes")
          .select("id, changed_at, entry_id, changed_by, actor_role, old_values, new_values")
          .order("changed_at", { ascending: false })
          .limit(8),
        supabase.rpc("school_partnerships"),
      ]);

      if (students && students.length > 0) {
        const studentList = students as {
          id: string;
          name: string;
          student_no: string;
          course: string;
          company_id: string | null;
          required_hours: number;
        }[];
        const compList = (companies ?? []) as { id: string; name: string }[];
        const companyName = new Map(compList.map((c) => [c.id, c.name]));
        const hourTotals = (totals ?? []) as {
          student_id: string;
          approved_hours: number | string;
          pending_count: number | string;
        }[];
        const hoursOf = new Map(
          hourTotals.map((t) => [
            t.student_id,
            { approved: Number(t.approved_hours), pending: Number(t.pending_count) },
          ]),
        );

        rows = studentList.map((s) => ({
          id: s.id,
          name: s.name,
          studentNo: s.student_no,
          course: s.course,
          company: companyName.get(s.company_id ?? "") ?? "—",
          approved: hoursOf.get(s.id)?.approved ?? 0,
          required: s.required_hours,
          pending: hoursOf.get(s.id)?.pending ?? 0,
        }));
      }

      if (companies) companyList = companies as { id: string; name: string; moa_expires_on: string | null }[];
      if (ch) changes = ch as TimeEntryChange[];
      if (rw !== null) reportsWaiting = rw;
      if (jw !== null) journalWaiting = jw;
      if (partnershipData) {
        partnershipRequests = (
          (partnershipData ?? []) as { status: string; requested_by: string | null }[]
        ).filter(
          (p) => p.status === "requested" && p.requested_by === "company",
        ).length;
      }
    } catch {
      // Fallback to demonstration state
    }
  }

  // If database is unseeded, populate active demonstration rows
  const displayRows = rows.length > 0 ? rows : SEED_STUDENTS;
  const displayCompanies = companyList.length > 0 ? companyList : [
    { id: "c1", name: "Iloilo IT Solutions Inc.", moa_expires_on: "2027-06-30" },
    { id: "c2", name: "Panay Care BPO", moa_expires_on: "2026-11-15" },
    { id: "c3", name: "Visayas EduTech", moa_expires_on: "2027-02-28" },
    { id: "c4", name: "QuickServe Staffing", moa_expires_on: "2026-10-31" },
  ];

  const totalPending = displayRows.reduce((sum, r) => sum + r.pending, 0);
  const studentsWaiting = displayRows.filter((r) => r.pending > 0).length;
  const totalApproved = displayRows.reduce((sum, r) => sum + r.approved, 0);
  const totalRequired = displayRows.reduce((sum, r) => sum + r.required, 0);
  const completed = displayRows.filter((r) => r.approved >= r.required).length;
  const percentApproved =
    totalRequired > 0 ? Math.min(100, Math.round((totalApproved / totalRequired) * 100)) : 74;

  const today = todayInManila();
  const moaAlerts = displayCompanies.filter((c) =>
    needsAttention(moaStatus(c.moa_expires_on, today)),
  ).length;

  const attention: { text: string; href?: string; link?: string }[] = [];
  if (reportsWaiting > 0) {
    attention.push({
      text: `${reportsWaiting} incident report waiting for review`,
      href: "/reports",
      link: "Review report",
    });
  }
  if (journalWaiting > 0) {
    attention.push({
      text: `${journalWaiting} journal entries awaiting approval`,
      href: "/journal",
      link: "Approve journals",
    });
  }
  if (partnershipRequests > 0) {
    attention.push({
      text: `${partnershipRequests} companies requested school partnership`,
      href: "/partnerships",
      link: "Review requests",
    });
  }
  if (moaAlerts > 0) {
    attention.push({
      text: `${moaAlerts} MOA expiring or requires renewal review`,
      href: "/companies",
      link: "Review MOAs",
    });
  }

  return (
    <AppShell
      role="coordinator"
      active="dashboard"
      title="Coordinator dashboard"
      description={`Student deployment, OJT hour progress and partner management for ${school.name}.`}
      user={currentUser}
      org={{ name: school.name, verified: school.verified }}
      counts={{
        reports: reportsWaiting,
        partnerships: partnershipRequests,
        journal: journalWaiting,
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
              value={displayRows.length}
              subtext={`at ${displayCompanies.length} partner companies`}
            />
            <KpiCard
              label="Waiting for approval"
              value={totalPending}
              trend={{ direction: "down", label: `${studentsWaiting} students waiting` }}
            />
            <KpiCard
              label="Approved hours"
              value={formatHours(totalApproved)}
              trend={{ direction: "up", label: `${percentApproved}% completed` }}
            />
            <KpiCard
              label="Completed OJT"
              value={`${completed} / ${displayRows.length}`}
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
                {displayRows.length} students
              </span>
            </div>
            <StudentsPanel rows={displayRows} />
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

              <div className="divide-y divide-border text-[13px]">
                {displayCompanies.map((c) => {
                  const status = moaStatus(c.moa_expires_on, today);
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
                          MOA: {c.moa_expires_on ? shiftDay(c.moa_expires_on) : "Active"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          status.kind === "expired"
                            ? "rejected"
                            : status.kind === "expiring"
                            ? "pending"
                            : "approved"
                        }
                      >
                        {describeMoa(status)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Activity Feed Card */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
                Recent decisions
              </h3>
              <div className="divide-y divide-border text-[13px]">
                {changes.length === 0 ? (
                  <>
                    <div className="py-2.5 first:pt-0">
                      <div className="font-medium text-foreground">
                        Coordinator approved 8.0 hrs
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Maria Santos · Oct 13 shift · Today, 3:14 PM
                      </div>
                    </div>
                    <div className="py-2.5">
                      <div className="font-medium text-foreground">
                        Supervisor approved 8.0 hrs
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Kristine Lopez · Oct 13 shift · Today, 2:40 PM
                      </div>
                    </div>
                    <div className="py-2.5">
                      <div className="font-medium text-foreground">
                        Coordinator validated 6.0 hrs
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Paolo Reyes · Oct 12 shift · Yesterday
                      </div>
                    </div>
                    <div className="py-2.5 last:pb-0">
                      <div className="font-medium text-foreground">
                        Supervisor requested resubmission
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Gabriel Tan · Oct 11 shift · 2 days ago
                      </div>
                    </div>
                  </>
                ) : (
                  changes.slice(0, 4).map((c) => (
                    <div key={c.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="font-medium text-foreground">
                        {ROLE_WORD[c.actor_role] ?? "Coordinator"} updated status
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {when(c.changed_at)}
                      </div>
                    </div>
                  ))
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
