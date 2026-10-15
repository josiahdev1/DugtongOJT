"use client";

import { useState } from "react";
import { EmptyState, Pill } from "@/components/ui";
import {
  JOURNAL_MAX_CHARS,
  JOURNAL_MIN_CHARS,
  JOURNAL_STATUS_LABEL,
} from "@/lib/journal";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { saveJournal } from "./actions";

export type JournalDay = {
  date: string;
  timeIn: string;
  timeOut: string;
  entry: {
    body: string;
    status: "submitted" | "approved" | "rejected";
    reviewNote: string | null;
  } | null;
};

const PILL: Record<string, "pending" | "approved" | "rejected"> = {
  submitted: "pending",
  approved: "approved",
  rejected: "rejected",
};

const INPUT =
  "w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function prettyDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function JournalClient({ days }: { days: JournalDay[] }) {
  // Start on the newest day that still has no journal, else the newest day.
  const first = days.find((d) => !d.entry) ?? days[0];
  const [date, setDate] = useState(first?.date ?? "");
  const day = days.find((d) => d.date === date) ?? first;
  const [body, setBody] = useState(day?.entry?.body ?? "");

  if (days.length === 0 || !day) {
    return (
      <div className="mx-auto w-full max-w-[375px] rounded-[12px] border border-border bg-card shadow-sm">
        <EmptyState
          title="No hours logged yet"
          description="Log a day on the My hours page, then come back to write about it."
        />
      </div>
    );
  }

  const pickDay = (next: string) => {
    setDate(next);
    setBody(days.find((d) => d.date === next)?.entry?.body ?? "");
  };

  const entry = day.entry;
  const locked = entry?.status === "approved";
  const hours = hoursBetween(day.timeIn, day.timeOut);
  const written = days.filter((d) => d.entry);

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      <form action={saveJournal} className="flex flex-col gap-4">
        <input type="hidden" name="work_date" value={day.date} />

        {/* Date & Hours Card */}
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="journal-day"
                className="block text-xs text-muted-foreground font-medium"
              >
                Date
              </label>
              <select
                id="journal-day"
                value={day.date}
                onChange={(e) => pickDay(e.target.value)}
                className={`${INPUT} mt-1`}
              >
                {days.map((d) => (
                  <option key={d.date} value={d.date}>
                    {prettyDate(d.date)}
                    {d.entry ? "" : " (no journal yet)"}
                  </option>
                ))}
              </select>
            </div>
            <Pill variant="trust">{formatHours(hours)} hrs</Pill>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Time in / out:{" "}
              <span className="font-mono text-foreground">
                {shortTime(day.timeIn)} - {shortTime(day.timeOut)}
              </span>
            </span>
            {entry ? (
              <Pill variant={PILL[entry.status]}>
                {JOURNAL_STATUS_LABEL[entry.status]}
              </Pill>
            ) : (
              <Pill variant="neutral">No journal yet</Pill>
            )}
          </div>
        </div>

        {entry?.status === "rejected" && entry.reviewNote && (
          <p className="rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <span className="font-medium">Your coordinator asked: </span>
            {entry.reviewNote}
          </p>
        )}

        {/* Daily reflection */}
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
          <div>
            <label
              htmlFor="journal-body"
              className="block text-xs font-medium text-muted-foreground mb-1.5"
            >
              What did you do, and what did you learn?
            </label>
            {locked ? (
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {entry?.body}
              </p>
            ) : (
              <>
                <textarea
                  id="journal-body"
                  name="body"
                  required
                  rows={6}
                  minLength={JOURNAL_MIN_CHARS}
                  maxLength={JOURNAL_MAX_CHARS}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe tasks completed, learnings, or blockers encountered"
                  className={`${INPUT} placeholder:text-muted-foreground resize-none`}
                />
                <div className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    At least {JOURNAL_MIN_CHARS} characters. Do not put
                    anyone else&apos;s private details in it.
                  </span>
                  <span className="font-mono shrink-0">
                    {body.length} / {JOURNAL_MAX_CHARS}
                  </span>
                </div>
              </>
            )}
          </div>
          {locked && (
            <p className="text-xs text-muted-foreground">
              This entry is approved, so it can no longer be edited.
            </p>
          )}
        </div>

        {!locked && (
          <button
            type="submit"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-[8px] bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {entry ? "Save changes" : "Submit for approval"}
          </button>
        )}
      </form>

      {written.length > 0 && (
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Your journals
          </h2>
          {written.map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => pickDay(d.date)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-[8px] border border-border px-3 py-2 text-left text-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-mono tabular-nums">{d.date}</span>
              {d.entry && (
                <Pill variant={PILL[d.entry.status]}>
                  {JOURNAL_STATUS_LABEL[d.entry.status]}
                </Pill>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
