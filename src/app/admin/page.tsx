import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "./admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { KpiCard } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { AdminVerificationsChart } from "./admin-charts";
import {
  AdminVerificationTable,
  type PendingCompany,
} from "./admin-verification-table";
import { AdminAside, type AsideActivity, type AsideEscalation } from "./admin-aside";
import { CATEGORY_LABEL } from "@/lib/reports";
import { DOCUMENT_KINDS } from "@/lib/employers";
import {
  buildWeeklySignups,
  daysSince,
  timeAgo,
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

  // Live queries, all in parallel.
  const [
    { data: schoolData },
    { data: employerData },
    { data: escalatedData },
    { data: flaggedData },
    { data: appealData },
  ] = await Promise.all([
    supabase.rpc("admin_list_schools"),
    supabase.rpc("admin_list_employers"),
    supabase.rpc("admin_escalated_reports"),
    supabase.rpc("admin_flagged_companies"),
    supabase.rpc("admin_pending_appeals"),
  ]);

  const schools = (schoolData ?? []) as SchoolRow[];
  const waitingSchools = schools.filter((s) => !s.verified);
  const verifiedSchoolsCount = schools.filter((s) => s.verified).length;

  const employers = (employerData ?? []) as EmployerRow[];
  const pendingEmployers = employers.filter((e) => e.status === "pending");
  const verifiedEmployersCount = employers.filter((e) => e.status === "verified").length;

  const escalated = (escalatedData ?? []) as EscalatedReportRow[];
  const flagged = (flaggedData ?? []) as FlaggedCompanyRow[];
  const appeals = (appealData ?? []) as AppealRow[];

  const reportsWaiting =
    escalated.length +
    appeals.length +
    flagged.filter((c) => c.review_state === "flagged").length;

  const totalWaiting = waitingSchools.length + pendingEmployers.length;

  // Oldest thing waiting for verification, and escalations older than 3 days.
  const oldestWaitingDays = [...waitingSchools, ...pendingEmployers].reduce(
    (max, r) => Math.max(max, daysSince(r.created_at)),
    0,
  );
  const olderThanThreeDays =
    escalated.filter((r) => daysSince(r.escalated_at) > 3).length +
    appeals.filter((r) => daysSince(r.created_at) > 3).length;

  const pendingCompanies: PendingCompany[] = pendingEmployers.map((e) => ({
    id: e.id,
    name: e.name,
    representative: e.representative_name,
    ownerEmail: e.owner_email,
    signedUp: e.created_at.slice(0, 10),
    docsUploaded: (e.has_registration ? 1 : 0) + (e.has_permit ? 1 : 0),
    docsRequired: DOCUMENT_KINDS.length,
  }));

  // Aside: newest waiting reports and appeals first.
  const escalationItems: (AsideEscalation & { at: string })[] = [
    ...escalated.map((r) => ({
      id: `r-${r.id}`,
      title: `${CATEGORY_LABEL[r.category] ?? r.category} report`,
      detail: `${r.company_name} · ${r.school_name} · ${daysSince(r.escalated_at)}d`,
      kind: "escalated" as const,
      at: r.escalated_at,
    })),
    ...appeals.map((a) => ({
      id: `a-${a.id}`,
      title: `Appeal: ${CATEGORY_LABEL[a.category] ?? a.category}`,
      detail: `${a.company_name} · ${a.school_name} · ${daysSince(a.created_at)}d`,
      kind: "appeal" as const,
      at: a.created_at,
    })),
  ].sort((x, y) => x.at.localeCompare(y.at));
  const asideEscalations: AsideEscalation[] = escalationItems
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      kind: item.kind,
    }));

  // Aside: recent real events (sign-ups and escalations), newest first.
  const activityItems: (Omit<AsideActivity, "when"> & { at: string })[] = [
    ...schools.map((s) => ({
      id: `s-${s.id}`,
      text: `School registered: ${s.name}`,
      at: s.created_at,
      tone: "primary" as const,
    })),
    ...employers.map((e) => ({
      id: `e-${e.id}`,
      text: `Company signed up: ${e.name}`,
      at: e.created_at,
      tone: "primary" as const,
    })),
    ...escalated.map((r) => ({
      id: `er-${r.id}`,
      text: `Report escalated: ${r.company_name}`,
      at: r.escalated_at,
      tone: "destructive" as const,
    })),
    ...appeals.map((a) => ({
      id: `ap-${a.id}`,
      text: `Appeal filed: ${a.company_name}`,
      at: a.created_at,
      tone: "destructive" as const,
    })),
  ]
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 5);
  const activity: AsideActivity[] = activityItems.map((a) => ({
    id: a.id,
    text: a.text,
    tone: a.tone,
    when: timeAgo(a.at),
  }));

  // Last 8 weeks of sign-ups. (An approved-hours chart was removed: an
  // admin has no permission to read time_entries, so it could never show data.)
  const verificationsChartData = buildWeeklySignups(schools, employers);

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
              value={verifiedSchoolsCount}
              subtitle={`${schools.length} registered`}
            />
            <KpiCard
              label="Partner companies"
              value={verifiedEmployersCount}
              subtitle={`${employers.length} registered`}
            />
            <KpiCard
              label="Awaiting verification"
              value={totalWaiting}
              subtitle={
                totalWaiting > 0
                  ? `Oldest waiting ${oldestWaitingDays} ${oldestWaitingDays === 1 ? "day" : "days"}`
                  : "All caught up"
              }
            />
            <KpiCard
              label="Open escalations"
              value={reportsWaiting}
              subtitle={
                olderThanThreeDays > 0
                  ? `${olderThanThreeDays} older than 3 days`
                  : "None older than 3 days"
              }
            />
          </div>

          {/* Company Verification Queue Table */}
          <AdminVerificationTable companies={pendingCompanies} />

          {/* Sign-ups per week (schools and companies) */}
          <AdminVerificationsChart data={verificationsChartData} />
        </div>

        {/* Right Aside (300px): Escalations + Sparkline & Audit Log */}
        <AdminAside
          escalationData={escalationsSparklineData}
          activeIssuesCount={reportsWaiting}
          escalations={asideEscalations}
          activity={activity}
        />
      </div>
    </div>
  );
}
