import { formatHours } from "@/lib/time";

// The completion certificate as a sheet of paper. Like the hours report it
// uses fixed black-on-white colors instead of the app theme, and it shows
// only what was stored when the certificate was issued. Both the
// coordinator's page and the student's page use it, so they always match.
export function CertificateSheet({
  schoolName,
  studentName,
  studentNo,
  course,
  companyName,
  hoursCompleted,
  requiredHours,
  issuedOn,
}: {
  schoolName: string;
  studentName: string;
  studentNo: string;
  course: string;
  companyName: string;
  hoursCompleted: number;
  requiredHours: number;
  issuedOn: string;
}) {
  return (
    <article
      id="pdf-sheet"
      className="flex flex-col items-center gap-6 rounded-[var(--radius)] border-4 border-double border-neutral-400 bg-white p-10 text-center text-neutral-900 print:rounded-none"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-600">
        {schoolName}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Certificate of Completion
      </h1>
      <p className="text-sm text-neutral-600">On-the-Job Training</p>

      <p className="text-sm text-neutral-600">This certifies that</p>
      <p className="border-b border-neutral-400 px-8 pb-1 text-2xl font-semibold">
        {studentName}
      </p>
      <p className="text-sm text-neutral-600">
        <span className="font-mono">{studentNo}</span> · {course}
      </p>

      <p className="max-w-lg text-sm leading-relaxed">
        has completed{" "}
        <span className="font-semibold tabular-nums">
          {formatHours(hoursCompleted)} hours
        </span>{" "}
        of on-the-job training, meeting the required{" "}
        <span className="tabular-nums">{requiredHours}</span> hours, at{" "}
        <span className="font-semibold">{companyName}</span>.
      </p>

      <p className="text-sm text-neutral-600">Issued on {issuedOn}</p>
    </article>
  );
}
