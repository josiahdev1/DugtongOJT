import { notFound, redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminEmptyState } from "../admin-empty-state";
import { AdminPageHeader } from "../admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <>
      <AdminPageHeader
        title="Companies"
        description="Host companies, registered business entities, and branch locations"
      />
      <AdminEmptyState
        icon={Building2}
        title="Company registry synchronized"
        description="Partner companies become active on the marketplace once business permits and SEC/DTI registrations are approved."
        actionHref="/admin/verifications"
        actionLabel="Review company verifications"
      />
    </>
  );
}
