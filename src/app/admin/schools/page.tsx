import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPageHeader } from "../admin-page-header";
import { loadVerificationData } from "../verifications/data";
import { VerificationPanels } from "../verifications/verification-panels";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const { schools, employers, documents } = await loadVerificationData(supabase, "schools");

  return (
    <>
      <AdminPageHeader
        title="Schools"
        description="Every school on Dugtong: who its coordinator is, how many students and companies it has, and whether it is verified"
      />

      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-4 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      <VerificationPanels
        schools={schools}
        employers={employers}
        documents={documents}
        show="schools"
        returnTo="/admin/schools"
      />
    </>
  );
}
