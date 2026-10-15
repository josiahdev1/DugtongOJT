import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { CertificateSheet } from "@/components/certificate-sheet";
import { SavePdfButton } from "@/components/save-pdf-button";
import { pdfFileName } from "@/lib/pdf-name";

export const dynamic = "force-dynamic";

// Like the hours report, the certificate is a sheet of paper, so it uses
// fixed black-on-white colors instead of the app theme.
//
// It shows ONLY what was stored when the certificate was issued, so it
// reads the same every time it is opened or printed.
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");
  if (!UUID_RE.test(id)) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id, name, student_no, course, company_id")
    .eq("id", id)
    .maybeSingle();
  if (!student) notFound();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("issued_at, hours_completed, required_hours")
    .eq("student_id", id)
    .maybeSingle();
  // No certificate has been issued yet: go back to the student page.
  if (!certificate) redirect(`/students/${id}`);

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", student.company_id)
    .maybeSingle();

  const issuedOn = new Date(certificate.issued_at).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "long",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/students/${id}`}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Back to student
        </Link>
        <SavePdfButton
          targetId="pdf-sheet"
          fileName={pdfFileName(student.name, school.name, "Certificate")}
        />
      </div>

      <CertificateSheet
        schoolName={school.name}
        studentName={student.name}
        studentNo={student.student_no}
        course={student.course}
        companyName={company?.name ?? "—"}
        hoursCompleted={Number(certificate.hours_completed)}
        requiredHours={certificate.required_hours}
        issuedOn={issuedOn}
      />
    </main>
  );
}
