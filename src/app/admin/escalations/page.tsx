import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPageHeader } from "../admin-page-header";
import type { AppealRow, EscalatedReportRow, FlaggedCompanyRow } from "../reports-card";
import { EscalationsView } from "./escalations-view";

export const dynamic = "force-dynamic";

export default async function AdminEscalationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const { data: escalatedData } = await supabase.rpc("admin_escalated_reports");
  const escalated = (escalatedData ?? []) as EscalatedReportRow[];

  const { data: flaggedData } = await supabase.rpc("admin_flagged_companies");
  const flagged = (flaggedData ?? []) as FlaggedCompanyRow[];

  const { data: appealData } = await supabase.rpc("admin_pending_appeals");
  const appeals = (appealData ?? []) as AppealRow[];

  return (
    <>
      <AdminPageHeader
        title="Escalations"
        description="Review student safety incident reports, company appeals, and partner flags"
      />

      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-4 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      <EscalationsView
        escalated={escalated}
        flagged={flagged}
        appeals={appeals}
      />
    </>
  );
}
