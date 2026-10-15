import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import {
  JOURNAL_STATUS_LABEL,
  REVIEW_NOTE_MAX_CHARS,
  type JournalEntry,
} from "@/lib/journal";
import { decideJournal } from "./actions";

export const dynamic = "force-dynamic";

export default async function JournalQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");

  // Row Level Security returns only this school's students' entries.
  const [{ data: waitingRows }, { data: decidedRows }, { data: students }] =
    await Promise.all([
      supabase
        .from("journal_entries")
        .select("id, student_id, work_date, body, status, review_note, updated_at")
        .eq("status", "submitted")
        .order("updated_at", { ascending: true }),
      supabase
        .from("journal_entries")
        .select("id, student_id, work_date, body, status, review_note, updated_at")
        .neq("status", "submitted")
        .order("decided_at", { ascending: false })
        .limit(20),
      supabase.from("students").select("id, name, student_no"),
    ]);
  const waiting = (waitingRows ?? []) as JournalEntry[];
  const decided = (decidedRows ?? []) as JournalEntry[];
  const studentOf = new Map((students ?? []).map((s) => [s.id, s]));

  return (
    <AppShell
      role="coordinator"
      active="journal"
      title="Journals"
      description="What students wrote about the days they worked. Approve an entry, or send it back with what to fix."
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
      counts={{ journal: waiting.length }}
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Waiting for your decision</CardTitle>
          <CardDescription>
            The student&apos;s supervisor can read these too, but only you
            approve them. Journals are separate from hours: approving one
            does not approve any hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {waiting.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No journal entries are waiting.
            </p>
          ) : (
            waiting.map((e) => (
              <article
                key={e.id}
                className="flex flex-col gap-3 rounded-[8px] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    <Link
                      href={`/students/${e.student_id}`}
                      className="underline underline-offset-4"
                    >
                      {studentOf.get(e.student_id)?.name ?? "A student"}
                    </Link>{" "}
                    <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
                      {e.work_date}
                    </span>
                  </p>
                  <Badge variant="pending">{JOURNAL_STATUS_LABEL.submitted}</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm">{e.body}</p>
                <form action={decideJournal} className="flex flex-col gap-2">
                  <input type="hidden" name="entry_id" value={e.id} />
                  <label
                    htmlFor={`note-${e.id}`}
                    className="text-xs text-muted-foreground"
                  >
                    If you reject it, say what to fix
                  </label>
                  <Input
                    id={`note-${e.id}`}
                    name="review_note"
                    maxLength={REVIEW_NOTE_MAX_CHARS}
                    className="max-w-xl"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" name="decision" value="approved">
                      Approve
                    </Button>
                    <Button
                      type="submit"
                      variant="outline"
                      name="decision"
                      value="rejected"
                    >
                      Reject
                    </Button>
                  </div>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Recently decided</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {decided.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing decided yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {decided.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span>
                    {studentOf.get(e.student_id)?.name ?? "A student"}{" "}
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {e.work_date}
                    </span>
                  </span>
                  <Badge variant={e.status === "approved" ? "approved" : "rejected"}>
                    {JOURNAL_STATUS_LABEL[e.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
