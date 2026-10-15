import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPageHeader } from "../admin-page-header";
import type { DocumentRow, EmployerRow } from "../employers-card";
import { VerificationPanels } from "./verification-panels";

export const dynamic = "force-dynamic";

type SchoolRow = {
  id: string;
  name: string;
  created_at: string;
  verified: boolean;
  coordinator_email: string | null;
  student_count: number;
  company_count: number;
};

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

  const { data: schoolData } = await supabase.rpc("admin_list_schools");
  const schools = (schoolData ?? []) as SchoolRow[];

  const { data: employerData } = await supabase.rpc("admin_list_employers");
  const employers = (employerData ?? []) as EmployerRow[];

  const { data: documentData } = await supabase
    .from("employer_documents")
    .select("id, employer_id, kind, file_name, created_at")
    .order("created_at", { ascending: false });
  const documents = (documentData ?? []) as DocumentRow[];

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
