import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "./admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  // Fetch counts for sidebar badges
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

  const waitingSchools = ((schoolData ?? []) as { verified: boolean }[]).filter(
    (s) => !s.verified,
  ).length;
  const pendingEmployers = (
    (employerData ?? []) as { status: string }[]
  ).filter((e) => e.status === "pending").length;
  const totalWaiting = waitingSchools + pendingEmployers;

  const escalated = (escalatedData ?? []) as unknown[];
  const appeals = (appealData ?? []) as unknown[];
  const flagged = (flaggedData ?? []) as { review_state: string }[];
  const reportsWaiting =
    escalated.length +
    appeals.length +
    flagged.filter((c) => c.review_state === "flagged").length;

  return (
    <AdminShell
      user={{ email: user.email }}
      counts={{
        verifications: totalWaiting,
        escalations: reportsWaiting,
      }}
    >
      {children}
    </AdminShell>
  );
}

