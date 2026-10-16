import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPageHeader } from "../admin-page-header";
import { loadVerificationData } from "./data";
import { VerificationPanels } from "./verification-panels";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const { schools, employers, documents } = await loadVerificationData(supabase);

  return (
    <>
      <AdminPageHeader
        title="Verifications"
        description="Review credentials, documents, and accreditation status for schools and partner companies"
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
      />
    </>
  );
}
