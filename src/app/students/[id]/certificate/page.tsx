import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { formatHours } from "@/lib/time";
import { PrintButton } from "../report/print-button";

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
        <PrintButton />
      </div>

      <article className="flex flex-col items-center gap-6 rounded-[var(--radius)] border-4 border-double border-neutral-400 bg-white p-10 text-center text-neutral-900 print:rounded-none">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-600">
          {school.name}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Certificate of Completion
        </h1>
        <p className="text-sm text-neutral-600">On-the-Job Training</p>

        <p className="text-sm text-neutral-600">This certifies that</p>
        <p className="border-b border-neutral-400 px-8 pb-1 text-2xl font-semibold">
          {student.name}
        </p>
        <p className="text-sm text-neutral-600">
          <span className="font-mono">{student.student_no}</span> · {student.course}
        </p>

        <p className="max-w-lg text-sm leading-relaxed">
          has completed{" "}
          <span className="font-semibold tabular-nums">
            {formatHours(Number(certificate.hours_completed))} hours
          </span>{" "}
          of on-the-job training, meeting the required{" "}
          <span className="tabular-nums">{certificate.required_hours}</span>{" "}
          hours, at <span className="font-semibold">{company?.name ?? "—"}</span>.
        </p>

        <p className="text-sm text-neutral-600">Issued on {issuedOn}</p>
      </article>
    </main>
  );
}
