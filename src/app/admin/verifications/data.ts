import type { createClient } from "@/lib/supabase/server";
import type { DocumentRow, EmployerRow } from "../employers-card";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type SchoolRow = {
  id: string;
  name: string;
  created_at: string;
  verified: boolean;
  coordinator_email: string | null;
  student_count: number;
  company_count: number;
};

// Everything the verification screens need, read through the admin-only
// database functions (they refuse anyone who is not an admin). Shared by
// the Verifications, Schools and Companies pages.
export async function loadVerificationData(
  supabase: Supabase,
  show: "both" | "schools" | "companies" = "both",
) {
  // A page that shows only one panel does not fetch (or send to the
  // browser) the other panel's data.
  const none = Promise.resolve({ data: null });
  const [{ data: schoolData }, { data: employerData }, { data: documentData }] =
    await Promise.all([
      show === "companies" ? none : supabase.rpc("admin_list_schools"),
      show === "schools" ? none : supabase.rpc("admin_list_employers"),
      show === "schools"
        ? none
        : supabase
            .from("employer_documents")
            .select("id, employer_id, kind, file_name, created_at")
            .order("created_at", { ascending: false }),
    ]);

  return {
    schools: (schoolData ?? []) as SchoolRow[],
    employers: (employerData ?? []) as EmployerRow[],
    documents: (documentData ?? []) as DocumentRow[],
  };
}
