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
        title="Tamper-evident audit trail"
        description="Every school verification, employer status change, and report resolution writes an immutable audit record in the database."
        actionHref="/admin"
        actionLabel="Return to overview"
      />
    </>
  );
}
