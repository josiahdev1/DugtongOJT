import { notFound, redirect } from "next/navigation";
import { School } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminEmptyState } from "../admin-empty-state";
import { AdminPageHeader } from "../admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <>
      <AdminPageHeader
        title="Schools"
        description="Institutions, campuses, and coordinator rosters enrolled across Dugtong"
      />
      <AdminEmptyState
        icon={School}
        title="School directory synchronized"
        description="Active schools and institutional rosters are reviewed and authenticated through credential verification."
        actionHref="/admin/verifications"
        actionLabel="Review school verifications"
      />
    </>
  );
}
