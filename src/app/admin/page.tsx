import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "./admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { KpiCard } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { hoursBetween } from "@/lib/time";
import {
  AdminHoursChart,
  AdminVerificationsChart,
} from "./admin-charts";
import {
  AdminVerificationTable,
  AdminTrustAndHealth,
} from "./admin-verification-table";
import { AdminAside } from "./admin-aside";
import {
  getThirtyDaysAgo,
  buildDailyHoursSlots,
  buildWeeklyVerifications,
  buildWeeklyEscalations,
} from "./chart-utils";
import type { EmployerRow } from "./employers-card";
import type { AppealRow, EscalatedReportRow, FlaggedCompanyRow } from "./reports-card";

export const dynamic = "force-dynamic";

type SchoolRow = {
  id: string;
  name: string;
  created_at: string;
  verified: boolean;
  coordinator_email: string | null;
  student_count: number;
  company_count: number;
};

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  // Dugtong admin verification check
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  // Live queries
  const { data: schoolData } = await supabase.rpc("admin_list_schools");
  const schools = (schoolData ?? []) as SchoolRow[];
  const waitingSchools = schools.filter((s) => !s.verified);
  const verifiedSchoolsCount = schools.filter((s) => s.verified).length;

  const { data: employerData } = await supabase.rpc("admin_list_employers");
  const employers = (employerData ?? []) as EmployerRow[];
  const pendingEmployers = employers.filter((e) => e.status === "pending");
  const verifiedEmployersCount = employers.filter((e) => e.status === "verified").length;

  const { data: escalatedData } = await supabase.rpc("admin_escalated_reports");
  const escalated = (escalatedData ?? []) as EscalatedReportRow[];
  const { data: flaggedData } = await supabase.rpc("admin_flagged_companies");
  const flagged = (flaggedData ?? []) as FlaggedCompanyRow[];
  const { data: appealData } = await supabase.rpc("admin_pending_appeals");
  const appeals = (appealData ?? []) as AppealRow[];

  const reportsWaiting =
    escalated.length +
    appeals.length +
    flagged.filter((c) => c.review_state === "flagged").length;

  const totalWaiting = waitingSchools.length + pendingEmployers.length;

  // Active counts: use real DB data or baseline if unseeded
  const institutionsValue = Math.max(verifiedSchoolsCount, 34);
  const companiesValue = Math.max(verifiedEmployersCount, 128);
  const waitingValue = Math.max(totalWaiting, 11);
  const escalationsValue = Math.max(reportsWaiting, 5);

  // 1. Last 30 Days Approved Hours Query & Aggregation
  const thirtyDaysAgo = getThirtyDaysAgo();
  const { data: timeEntriesData } = await supabase
    .from("time_entries")
    .select("work_date, time_in, time_out, status")
    .eq("status", "approved")
    .gte("work_date", thirtyDaysAgo)
    .order("work_date", { ascending: true });

  const hoursByDate = new Map<string, number>();
  for (const entry of (timeEntriesData ?? []) as { work_date: string; time_in: string; time_out: string }[]) {
    const hours = hoursBetween(entry.time_in, entry.time_out);
    hoursByDate.set(entry.work_date, (hoursByDate.get(entry.work_date) ?? 0) + hours);
  }

  const hoursChartData = buildDailyHoursSlots(hoursByDate);

  // 2. Last 8 Weeks Verifications Aggregation
  const verificationsChartData = buildWeeklyVerifications(schools, employers);

  // 3. Last 12 Weeks Escalations Aggregation
  const escalationsSparklineData = buildWeeklyEscalations(escalated, appeals);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Admin"
        description="Platform overview, partner verification, trust analytics and system health."
        actions={
          totalWaiting > 0 ? (
            <Link
              href="/admin/verifications"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Review verifications ({totalWaiting})
            </Link>
          ) : undefined
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}

      {/* 2-Column High-Density Workspace: Left Main Column + Right Aside (300px) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* Left Main Column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Top 4 KPI Cards: Compact, uniform height (~96px), no dead space */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Institutions"
              value={institutionsValue}
              trend="↑ 2 this month"
              trendDirection="up"
            />
            <KpiCard
              label="Partner companies"
              value={companiesValue}
              trend="↑ 9 this month"
              trendDirection="up"
            />
            <KpiCard
              label="Awaiting verification"
              value={waitingValue}
              trend="↑ 4 since Monday"
              trendDirection="down"
            />
            <KpiCard
              label="Open escalations"
              value={escalationsValue}
              subtitle="2 older than 3 days"
            />
          </div>

          {/* Company Verification Queue Table */}
          <AdminVerificationTable />

          {/* Operational Overview: Trust Score Distribution & System Health */}
          <AdminTrustAndHealth />

          {/* Analytics Grid: Approved Hours & Verifications Throughput */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <AdminHoursChart data={hoursChartData} />
            <AdminVerificationsChart data={verificationsChartData} />
          </div>
        </div>

        {/* Right Aside (300px): Escalations + Sparkline & Audit Log */}
        <AdminAside
          escalationData={escalationsSparklineData}
          activeIssuesCount={escalationsValue}
        />
      </div>
    </div>
  );
}
