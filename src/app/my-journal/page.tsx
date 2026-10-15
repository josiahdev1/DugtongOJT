import { redirect } from "next/navigation";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/app-shell";
import type { JournalEntry } from "@/lib/journal";
import { JournalClient, type JournalDay } from "./journal-client";

export const dynamic = "force-dynamic";

export default async function MyJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) redirect("/dashboard");

  const student = await findStudent(supabase);
  if (!student) redirect("/");

  // The days this student logged hours, and the journal for each. Row Level
  // Security returns only their own.
  const [{ data: days }, { data: entryRows }] = await Promise.all([
    supabase
      .from("time_entries")
      .select("work_date, time_in, time_out")
      .eq("student_id", student.id)
      .order("work_date", { ascending: false })
      .limit(60),
    supabase
      .from("journal_entries")
      .select("id, student_id, work_date, body, status, review_note, updated_at")
      .eq("student_id", student.id),
  ]);

  const entryOf = new Map(
    ((entryRows ?? []) as JournalEntry[]).map((e) => [e.work_date, e]),
  );
  const seen = new Set<string>();
  const journalDays: JournalDay[] = [];
  for (const d of days ?? []) {
    if (seen.has(d.work_date)) continue;
    seen.add(d.work_date);
    const e = entryOf.get(d.work_date);
    journalDays.push({
      date: d.work_date,
      timeIn: d.time_in,
      timeOut: d.time_out,
      entry: e
        ? { body: e.body, status: e.status, reviewNote: e.review_note }
        : null,
    });
  }
  const todo = journalDays.filter((d) => !d.entry).length;

  return (
    <AppShell
      role="student"
      active="journal"
      title="My journal"
      description={
        journalDays.length === 0
          ? "Log your hours first. Then you can write a journal for each day."
          : `${todo} ${todo === 1 ? "day has" : "days have"} no journal yet. Write what you did and what you learned.`
      }
      user={user}
    >
      {error && (
        <div
          role="alert"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          {message}
        </div>
      )}

      <JournalClient days={journalDays} />
    </AppShell>
  );
}
