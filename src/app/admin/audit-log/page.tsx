import { notFound, redirect } from "next/navigation";
import { History } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminEmptyState } from "../admin-empty-state";
import { AdminPageHeader } from "../admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Append-only compliance log of administrative decisions and authentication events"
      />
      <AdminEmptyState
        icon={History}
        title="No admin audit log yet"
        description="Approvals and rejections of hours are logged on each student's page (coordinator view). A log of admin decisions has not been built yet."
        actionHref="/admin"
        actionLabel="Return to overview"
      />
    </>
  );
}
