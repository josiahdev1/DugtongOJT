import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { decideEntry } from "./actions";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

type Snapshot = {
  status?: string;
  work_date?: string;
  time_in?: string;
  time_out?: string;
};

// "pending → approved" or "08:00–17:00 → 08:00–18:00", whichever changed.
function describeChange(oldV: Snapshot, newV: Snapshot) {
  const parts: string[] = [];
  if (oldV.status !== newV.status) {
    parts.push(
      `${STATUS_LABEL[oldV.status ?? ""] ?? oldV.status} → ${STATUS_LABEL[newV.status ?? ""] ?? newV.status}`,
    );
  }
  if (oldV.time_in !== newV.time_in || oldV.time_out !== newV.time_out) {
    parts.push(
      `${shortTime(oldV.time_in ?? "")}–${shortTime(oldV.time_out ?? "")} → ${shortTime(newV.time_in ?? "")}–${shortTime(newV.time_out ?? "")}`,
    );
  }
  return parts.join("; ");
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");
  if (!UUID_RE.test(id)) notFound();

  // Row Level Security returns this row only if the student belongs to the
  // coordinator's own school. Anyone else's student looks like "not found".
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
      supabase
        .from("time_entries")
        .select("id, work_date, time_in, time_out, status")
        .eq("student_id", id)
        .order("work_date", { ascending: false }),
      // Added up by the database, not by this page.
      supabase
        .from("student_hours")
        .select("approved_hours, pending_count")
        .eq("student_id", id)
        .maybeSingle(),
    ]);

  const entryIds = (entries ?? []).map((e) => e.id);
  const dateOf = new Map((entries ?? []).map((e) => [e.id, e.work_date]));
  const { data: changes } =
    entryIds.length === 0
      ? { data: [] }
      : await supabase
          .from("time_entry_changes")
          .select("id, changed_at, entry_id, changed_by, old_values, new_values")
          .in("entry_id", entryIds)
          .order("changed_at", { ascending: false });

  const approved = Number(totals?.approved_hours ?? 0);
  const pending = Number(totals?.pending_count ?? 0);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/dashboard"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {student.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {student.course} · {company?.name ?? "No company"} ·{" "}
          <span className="font-mono text-xs">{student.student_no}</span> ·{" "}
          {student.email}
        </p>
      </header>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approved hours</CardTitle>
          <CardDescription>
            {pending > 0
              ? `${pending} ${pending === 1 ? "entry is" : "entries are"} waiting for your decision.`
              : "Nothing is waiting for your decision."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-semibold tabular-nums">
            {formatHours(approved)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              of {student.required_hours} hours
            </span>
          </p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary"
            value={Math.min(approved, student.required_hours)}
            max={student.required_hours}
            aria-label="Approved hours progress"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time entries</CardTitle>
          <CardDescription>
            Approve or reject each day. You can change a decision later; every
            change is logged below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This student has not logged any hours yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">{e.work_date}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_in)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_out)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(hoursBetween(e.time_in, e.time_out))}
                      </td>
                      <td className="px-3 py-2">
                        {STATUS_LABEL[e.status] ?? e.status}
                      </td>
                      <td className="px-3 py-2">
                        <form action={decideEntry} className="flex gap-2">
                          <input type="hidden" name="entry_id" value={e.id} />
                          <input type="hidden" name="student_id" value={id} />
                          {e.status !== "approved" && (
                            <Button
                              type="submit"
                              size="sm"
                              name="decision"
                              value="approved"
                            >
                              Approve
                            </Button>
                          )}
                          {e.status !== "rejected" && (
                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                              name="decision"
                              value="rejected"
                            >
                              Reject
                            </Button>
                          )}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change history</CardTitle>
          <CardDescription>
            Every decision and every change after one. Nobody can edit this
            list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!changes || changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No decisions yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">By</th>
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">
                        {formatWhen(c.changed_at)}
                      </td>
                      <td className="px-3 py-2">
                        {c.changed_by === user.id ? "You" : "Student"}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {dateOf.get(c.entry_id) ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {describeChange(
                          c.old_values as Snapshot,
                          c.new_values as Snapshot,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
