import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminEmptyState } from "../admin-empty-state";
import { AdminPageHeader } from "../admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Role provisioning, security profiles, and account authorizations"
      />
      <AdminEmptyState
        icon={Users}
        title="No user directory yet"
        description="A list of accounts and roles has not been built yet. Schools, companies and verification are managed from their own pages."
        actionHref="/admin/verifications"
        actionLabel="Review pending accounts"
      />
    </>
  );
}
