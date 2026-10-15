import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentUser } from "@/lib/auth";
import type { JournalEntry } from "@/lib/journal";
import { todayInManila } from "@/lib/time";
import {
  SupervisorWorkspaceClient,
  type AppealRow,
  type PendingEntry,
  type StudentRow,
  type TodayEntry,
  type UpheldReport,
} from "./supervisor-client";

export const dynamic = "force-dynamic";

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

  const today = todayInManila();

  // Everything below is read-only and scoped by Row Level Security (and, for
  // the RPCs, by the database functions) to THIS supervisor's company, so all
  // of it can be fetched in parallel.
  const [
    { data: studentData },
    { data: reportData },
    { data: appealData },
    { data: journalData },
    { data: companies },
    { data: pending },
    { data: todayData },
    { data: evaluationRows },
  ] = await Promise.all([
    supabase.rpc("supervisor_students"),
    supabase.rpc("supervisor_upheld_reports"),
    supabase
      .from("report_appeals")
      .select(
        "id, report_id, category, related_date, report_description, reason, status",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("journal_entries")
      .select("id, student_id, work_date, body, status, review_note, updated_at")
      .order("work_date", { ascending: false })
      .limit(10),
    supabase.from("companies").select("id, name"),
    supabase
      .from("time_entries")
      .select("id, student_id, work_date, time_in, time_out")
      .eq("status", "pending")
      .order("work_date", { ascending: true }),
    supabase
      .from("time_entries")
      .select("student_id, time_in, time_out")
      .eq("work_date", today),
    supabase.from("evaluations").select("student_id"),
  ]);

  const students = (studentData ?? []) as StudentRow[];
  const upheldReports = (reportData ?? []) as UpheldReport[];
  const appeals = (appealData ?? []) as AppealRow[];
  const journal = (journalData ?? []) as JournalEntry[];
  const companyList = (companies ?? []) as { id: string; name: string }[];

  const companyName = Object.fromEntries(companyList.map((c) => [c.id, c.name]));
  const evaluatedIds = [
    ...new Set((evaluationRows ?? []).map((r) => r.student_id as string)),
  ];

  return (
    <AppShell
      role="supervisor"
      active="dashboard"
      title="Supervisor workspace"
      description={`Hours your students logged at ${companyList.map((c) => c.name).join(", ") || "your company"}.`}
      user={user}
      org={companyList.length > 0 ? { name: companyList[0].name } : undefined}
      wide
    >
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <SupervisorWorkspaceClient
        today={today}
        students={students}
        pending={(pending ?? []) as PendingEntry[]}
        todayEntries={(todayData ?? []) as TodayEntry[]}
        evaluatedIds={evaluatedIds}
        companyName={companyName}
        upheldReports={upheldReports}
        appeals={appeals}
        journal={journal}
      />
    </AppShell>
  );
}
