import { notFound, redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminEmptyState } from "../admin-empty-state";
import { AdminPageHeader } from "../admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Global system configuration, security parameters, and data retention rules"
      />
      <AdminEmptyState
        icon={Settings}
        title="No settings here yet"
        description="Configuration (Supabase keys, sign-in redirect URLs, rate limits) is managed in the Vercel and Supabase dashboards."
        actionHref="/admin"
        actionLabel="Return to overview"
      />
    </>
  );
}
