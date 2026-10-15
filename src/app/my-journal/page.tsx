import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { findStudent, getCurrentUser } from "@/lib/auth";
import {
  JOURNAL_MAX_CHARS,
  JOURNAL_MIN_CHARS,
  JOURNAL_STATUS_LABEL,
  type JournalEntry,
} from "@/lib/journal";
import { saveJournal } from "./actions";

export const dynamic = "force-dynamic";

const BADGE: Record<string, "pending" | "approved" | "rejected"> = {
  submitted: "pending",
  approved: "approved",
  rejected: "rejected",
};

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
      .select("work_date")
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
  const workDates = [...new Set((days ?? []).map((d) => d.work_date))];
  const todo = workDates.filter((d) => !entryOf.has(d)).length;

  return (
    <AppShell
      role="student"
      active="journal"
      title="My journal"
      description={
        workDates.length === 0
          ? "Log your hours first. Then you can write a journal for each day."
          : `${todo} ${todo === 1 ? "day has" : "days have"} no journal yet. Write what you did and what you learned.`
      }
      user={user}
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="rounded-[8px] border border-success/30 bg-success-bg p-3 text-xs font-medium text-success-text"
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Your days</CardTitle>
          <CardDescription>
            One journal entry for each day you logged hours. Your coordinator
            approves it, and your supervisor can read it. You can edit an
            entry until it is approved; editing a rejected one sends it again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {workDates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have not logged any hours yet. Log a day on the My hours
              page, then come back to write about it.
            </p>
          ) : (
            workDates.map((date) => {
              const entry = entryOf.get(date);
              return (
                <article
                  key={date}
                  className="flex flex-col gap-2 rounded-[8px] border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-sm font-medium tabular-nums text-foreground">
                      {date}
                    </p>
                    {entry ? (
                      <Badge variant={BADGE[entry.status]}>
                        {JOURNAL_STATUS_LABEL[entry.status]}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No journal yet</Badge>
                    )}
                  </div>

                  {entry?.status === "rejected" && entry.review_note && (
                    <p className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs text-destructive-text">
                      <span className="font-medium">Your coordinator asked: </span>
                      {entry.review_note}
                    </p>
                  )}

                  {entry && (
                    <p className="whitespace-pre-wrap text-sm">{entry.body}</p>
                  )}

                  {entry?.status !== "approved" && (
                    <details>
                      <summary className="w-fit cursor-pointer list-none rounded-[8px] border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {entry ? "Edit this entry" : "Write this day's journal"}
                      </summary>
                      <form
                        action={saveJournal}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <input type="hidden" name="work_date" value={date} />
                        <label
                          htmlFor={`body-${date}`}
                          className="text-sm font-medium"
                        >
                          What did you do, and what did you learn?
                        </label>
                        <Textarea
                          id={`body-${date}`}
                          name="body"
                          required
                          rows={5}
                          minLength={JOURNAL_MIN_CHARS}
                          maxLength={JOURNAL_MAX_CHARS}
                          defaultValue={entry?.body ?? ""}
                        />
                        <p className="text-xs text-muted-foreground">
                          At least {JOURNAL_MIN_CHARS} characters. Do not put
                          anyone else&apos;s private details in it.
                        </p>
                        <div>
                          <Button type="submit" size="sm">
                            {entry ? "Save changes" : "Submit journal"}
                          </Button>
                        </div>
                      </form>
                    </details>
                  )}
                </article>
              );
            })
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
