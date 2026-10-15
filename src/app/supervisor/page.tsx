import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/app-shell";
import { SupervisorWorkspaceClient } from "./supervisor-client";

export const dynamic = "force-dynamic";

export default async function SupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { user, supabase } = await getCurrentUser();

  // If user is authenticated, query their students' entries
  let realJournals = undefined;

  if (user && supabase) {
    try {
      const { data: isSupervisor } = await supabase.rpc("is_supervisor");
      if (isSupervisor) {
        const { data: studentData } = await supabase.rpc("supervisor_students");
        const students = (studentData ?? []) as { id: string; name: string }[];
        const nameOf = new Map(students.map((s) => [s.id, s.name]));

        const { data: pending } = await supabase
          .from("time_entries")
          .select("id, student_id, work_date, time_in, time_out, notes")
          .order("work_date", { ascending: false })
          .limit(10);

        if (pending && pending.length > 0) {
          realJournals = pending.map((e) => ({
            id: e.id,
            intern: nameOf.get(e.student_id) || "Student Intern",
            date: e.work_date,
            hours: 8,
            summary: e.notes || "Daily work log & tasks",
            status: "pending" as const,
            timeCategory: "today" as const,
          }));
        }
      }
    } catch {
      // Graceful fallback to default seed data if database is unseeded
    }
  }

  const currentUser = user ?? { email: "supervisor@iloilotech.ph" };

  return (
    <AppShell
      role="supervisor"
      active="dashboard"
      title="Supervisor workspace"
      description="Company-side view. Approve daily journals, track interns' hours, and file evaluations without leaving one screen."
      user={currentUser}
      org={{
        name: "Iloilo IT Solutions Inc.",
        verified: true,
        trustScore: 94,
      }}
      wide
    >
      {error && (
        <div className="rounded-[8px] bg-destructive/10 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}
      <SupervisorWorkspaceClient initialJournals={realJournals} />
    </AppShell>
  );
}
