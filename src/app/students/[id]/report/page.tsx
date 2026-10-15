import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  formatHours,
  hoursBetween,
  shortTime,
  todayInManila,
} from "@/lib/time";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The report is a sheet of paper, so it uses fixed black-on-white colors
// instead of the app theme. Otherwise a coordinator on a dark-mode laptop
// would print pale text on white paper.
export default async function HoursReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");
  if (!UUID_RE.test(id)) notFound();

  // Row Level Security returns the student only if they belong to this
  // coordinator's school, so another school's student is "not found".
  const { data: student } = await supabase
    .from("students")
    .select("id, name, student_no, course, email, company_id, required_hours")
    .eq("id", id)
    .maybeSingle();
  if (!student) notFound();

  const [{ data: company }, { data: entries }, { data: totals }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("name, supervisor_name")
        .eq("id", student.company_id)
        .maybeSingle(),
      // Only approved days are in the report.
      supabase
        .from("time_entries")
        .select("id, work_date, time_in, time_out")
        .eq("student_id", id)
        .eq("status", "approved")
        .order("work_date", { ascending: true }),
      // The total comes from the database, the same figure the Dashboard shows.
      supabase
        .from("student_hours")
        .select("approved_hours")
        .eq("student_id", id)
        .maybeSingle(),
    ]);

  const approved = Number(totals?.approved_hours ?? 0);
  const required = student.required_hours;
  const percent = Math.min(100, Math.round((approved / required) * 100));
  const remaining = Math.max(0, required - approved);

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

      <article className="flex flex-col gap-6 rounded-[var(--radius)] border border-neutral-300 bg-white p-8 text-neutral-900 print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-col gap-1 border-b border-neutral-300 pb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            {school.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            OJT Hours Report
          </h1>
        </header>

        <section className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-neutral-600">Student</p>
            <p className="font-medium">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Student ID</p>
            <p className="font-mono">{student.student_no}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Course</p>
            <p>{student.course}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Email</p>
            <p>{student.email}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Partner company</p>
            <p>{company?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Supervisor</p>
            <p>{company?.supervisor_name ?? "—"}</p>
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-[var(--radius)] border border-neutral-300 p-4">
          <p className="text-sm text-neutral-600">Progress toward required hours</p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatHours(approved)}{" "}
            <span className="text-base font-normal text-neutral-600">
              of {required} hours ({percent}%)
            </span>
          </p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:bg-neutral-200 [&::-webkit-progress-value]:bg-neutral-900"
            value={Math.min(approved, required)}
            max={required}
            aria-label="Approved hours progress"
          />
          <p className="text-sm text-neutral-600">
            {remaining === 0
              ? "Required hours reached."
              : `${formatHours(remaining)} hours remaining.`}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Approved days</h2>
          {!entries || entries.length === 0 ? (
            <p className="text-sm text-neutral-600">
              No approved hours yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-300 text-xs text-neutral-600">
                <tr>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Time in</th>
                  <th className="py-2 pr-3 font-medium">Time out</th>
                  <th className="py-2 text-right font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-200">
                    <td className="py-2 pr-3 tabular-nums">{e.work_date}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {shortTime(e.time_in)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {shortTime(e.time_out)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatHours(hoursBetween(e.time_in, e.time_out))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-3 text-right font-medium">
                    Total approved hours
                  </td>
                  <td className="pt-3 text-right font-semibold tabular-nums">
                    {formatHours(approved)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <footer className="border-t border-neutral-300 pt-4 text-xs text-neutral-600">
          Only entries approved by the coordinator are counted. Prepared by{" "}
          {user.email} on {todayInManila()}.
        </footer>
      </article>
    </main>
  );
}
