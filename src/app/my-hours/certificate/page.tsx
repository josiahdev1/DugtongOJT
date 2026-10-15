import Link from "next/link";
import { redirect } from "next/navigation";
import { CertificateSheet } from "@/components/certificate-sheet";
import { SavePdfButton } from "@/components/save-pdf-button";
import { getCurrentUser } from "@/lib/auth";
import { pdfFileName } from "@/lib/pdf-name";

export const dynamic = "force-dynamic";

type MyCertificate = {
  issued_at: string;
  hours_completed: number;
  required_hours: number;
  student_name: string;
  student_no: string;
  course: string;
  company_name: string;
  school_name: string;
};

// A student's own completion certificate, once their coordinator has issued
// it. The database function returns only THEIR certificate, as it was
// stored when it was issued.
export default async function MyCertificatePage() {
  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) redirect("/dashboard"); // coordinators use the student's page

  const { data } = await supabase.rpc("my_certificate");
  const c = ((data ?? []) as MyCertificate[])[0];
  // Not issued yet: back to the hours page.
  if (!c) redirect("/my-hours");

  const issuedOn = new Date(c.issued_at).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "long",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/my-hours"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Back to my hours
        </Link>
        <SavePdfButton
          targetId="pdf-sheet"
          fileName={pdfFileName(c.student_name, c.school_name, "Certificate")}
        />
      </div>

      <CertificateSheet
        schoolName={c.school_name}
        studentName={c.student_name}
        studentNo={c.student_no}
        course={c.course}
        companyName={c.company_name}
        hoursCompleted={Number(c.hours_completed)}
        requiredHours={c.required_hours}
        issuedOn={issuedOn}
      />
    </main>
  );
}
