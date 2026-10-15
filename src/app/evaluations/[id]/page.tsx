import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  averageRating,
  CRITERIA_GROUPS,
  RATING_LABELS,
  type Evaluation,
} from "@/lib/evaluation";
import { UUID_RE } from "@/lib/ids";
import { SavePdfButton } from "@/components/save-pdf-button";
import { pdfFileName } from "@/lib/pdf-name";

export const dynamic = "force-dynamic";

// The evaluation as a sheet of paper, for the student's supervisor and the
// school's coordinator. Like the hours report and the certificate it uses
// fixed black-on-white colors, and the browser's "Save as PDF" makes the
// PDF. It shows only what is stored, so it reads the same every time.
export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!UUID_RE.test(id)) notFound();

  // Row Level Security returns this row only to the student's supervisor
  // or to the coordinator of the student's school.
  const { data } = await supabase
    .from("evaluations")
    .select("*")
    .eq("student_id", id)
    .maybeSingle();
  if (!data) notFound();
  const e = data as Evaluation;

  const backHref = school ? `/students/${id}` : "/supervisor";
  const average = averageRating(e);
  const submitted = new Date(e.updated_at).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "long",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Back
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {!school && (
            <Link
              href={`/supervisor/evaluate/${id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit evaluation
            </Link>
          )}
          <SavePdfButton
            targetId="pdf-sheet"
            fileName={pdfFileName(e.trainee_name, e.school_name, "Evaluation")}
          />
        </div>
      </div>

      <article id="pdf-sheet" className="flex flex-col gap-5 rounded-[var(--radius)] border border-neutral-300 bg-white p-8 text-sm text-neutral-900 print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-col gap-1 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-600">
            {e.school_name}
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            OJT Evaluation SY2526
          </h1>
          <p className="text-xs text-neutral-600">
            Student-trainee performance evaluation by the immediate supervisor
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-neutral-300 py-3">
          <Field label="Trainee" value={e.trainee_name} />
          <Field label="Student ID" value={e.student_no} />
          <Field label="Course" value={e.course} />
          <Field label="Company/Agency" value={e.company_name} />
          <Field label="Department assigned" value={e.department} />
          <Field label="Date" value={submitted} />
          <Field label="Supervisor" value={e.supervisor_name} />
          <Field label="Position" value={e.supervisor_position} />
        </dl>

        <p className="text-xs text-neutral-600">
          Ratings:{" "}
          {[5, 4, 3, 2, 1].map((n) => `${n} – ${RATING_LABELS[n]}`).join(" · ")}
        </p>

        {CRITERIA_GROUPS.map((group) => (
          <section
            key={group.title}
            className="flex flex-col gap-3 break-inside-avoid"
          >
            <h2 className="border-b border-neutral-300 pb-1 text-base font-semibold">
              {group.title}
            </h2>
            {group.criteria.map((c) => {
              const rating = Number(e[c.key]);
              return (
                <div
                  key={c.key}
                  className="flex items-start justify-between gap-4 break-inside-avoid"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-neutral-600">{c.description}</p>
                  </div>
                  {/* The chosen number is circled, as on the paper form. */}
                  <ol
                    className="flex shrink-0 gap-1.5"
                    aria-label={`Rating ${rating} of 5`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <li
                        key={n}
                        className={
                          n === rating
                            ? "flex size-6 items-center justify-center rounded-full border-2 border-neutral-900 text-xs font-bold tabular-nums"
                            : "flex size-6 items-center justify-center text-xs tabular-nums text-neutral-500"
                        }
                      >
                        {n}
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </section>
        ))}

        <p className="border-t border-neutral-300 pt-3 font-medium">
          Average rating:{" "}
          <span className="tabular-nums">{average.toFixed(1)}</span> / 5
        </p>

        <Text label="Strong points" value={e.strong_points} />
        <Text label="Areas for improvement" value={e.improvements} />
        <Text label="Comments" value={e.comments || "None."} />
      </article>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-neutral-600">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return (
    <section className="flex flex-col gap-1 break-inside-avoid">
      <h2 className="text-sm font-semibold">{label}</h2>
      <p className="whitespace-pre-wrap">{value}</p>
    </section>
  );
}
