"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  EmptyState,
  KpiCard,
  Pill,
  ProgressBar,
  buttonVariants,
} from "@/components/ui";
import type { JournalEntry } from "@/lib/journal";
import { JOURNAL_STATUS_LABEL } from "@/lib/journal";
import { APPEAL_STATUS_LABEL, CATEGORY_LABEL } from "@/lib/reports";
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { appealReport, decideAsSupervisor } from "./actions";

export type StudentRow = {
  id: string;
  name: string;
  student_no: string;
  course: string;
  required_hours: number;
  company_id: string;
  approved_hours: number;
  pending_count: number;
};

export type PendingEntry = {
  id: string;
  student_id: string;
  work_date: string;
  time_in: string;
  time_out: string;
};

export type TodayEntry = {
  student_id: string;
  time_in: string;
  time_out: string;
};

export type UpheldReport = {
  id: string;
  company_id: string;
  category: string;
  related_date: string;
  description: string;
};

export type AppealRow = {
  id: string;
  report_id: string;
  category: string;
  related_date: string;
  report_description: string;
  reason: string;
  status: string;
};

type Filter = "all" | "today" | "earlier";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const CARD = "rounded-[12px] border border-border bg-card shadow-sm";
const TITLE = "text-[15px] font-medium leading-5 text-foreground";

export function SupervisorWorkspaceClient({
  today,
  students,
  pending,
  todayEntries,
  evaluatedIds,
  companyName,
  upheldReports,
  appeals,
  journal,
}: {
  today: string;
  students: StudentRow[];
  pending: PendingEntry[];
  todayEntries: TodayEntry[];
  evaluatedIds: string[];
  companyName: Record<string, string>;
  upheldReports: UpheldReport[];
  appeals: AppealRow[];
  journal: JournalEntry[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const nameOf = new Map(students.map((s) => [s.id, s.name]));
  const evaluated = new Set(evaluatedIds);
  const appealOf = new Map(appeals.map((a) => [a.report_id, a]));
  const todayOf = new Map(todayEntries.map((e) => [e.student_id, e]));

  const filtered = pending.filter((e) =>
    filter === "all"
      ? true
      : filter === "today"
        ? e.work_date === today
        : e.work_date < today,
  );

  const pendingHours = pending.reduce(
    (sum, e) => sum + Math.max(0, hoursBetween(e.time_in, e.time_out)),
    0,
  );
  const approvedHours = students.reduce(
    (sum, s) => sum + Number(s.approved_hours),
    0,
  );
  const notEvaluated = students.filter((s) => !evaluated.has(s.id)).length;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "earlier", label: "Earlier" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_292px] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Active interns"
              value={students.length}
              subtitle="Placed at your company"
            />
            <KpiCard
              label="Hours to approve"
              value={pending.length}
              subtitle={
                pending.length === 0
                  ? "Nothing waiting"
                  : `${formatHours(pendingHours)} hrs waiting`
              }
            />
            <KpiCard
              label="Evaluations due"
              value={notEvaluated}
              subtitle={
                students.length === 0
                  ? "No interns yet"
                  : `${students.length - notEvaluated} of ${students.length} submitted`
              }
            />
            <KpiCard
              label="Hours approved"
              value={formatHours(approvedHours)}
              subtitle="All interns, to date"
            />
          </div>

          {/* Hours approvals */}
          <div className={cn(CARD, "overflow-hidden")} id="journals">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
              <h2 className={TITLE}>Hours approvals</h2>
              <div
                className="inline-flex rounded-[8px] bg-surface p-0.5"
                role="group"
                aria-label="Filter entries by date"
              >
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={filter === t.key}
                    onClick={() => setFilter(t.key)}
                    className={cn(
                      "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
                      filter === t.key
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title={
                  pending.length === 0
                    ? "Nothing is waiting"
                    : "No entries in this view"
                }
                description={
                  pending.length === 0
                    ? "When your interns log hours, they will show up here for your approval."
                    : "Try another filter."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface text-[12px] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-3 py-2 font-medium">Intern</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">In</th>
                      <th className="px-3 py-2 font-medium">Out</th>
                      <th className="px-3 py-2 font-medium">Hours</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Decision
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((e) => (
                      <tr
                        key={e.id}
                        className="hover:bg-surface/50 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                          {nameOf.get(e.student_id) ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap tabular-nums">
                          {e.work_date}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap tabular-nums">
                          {shortTime(e.time_in)}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap tabular-nums">
                          {shortTime(e.time_out)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">
                          {formatHours(hoursBetween(e.time_in, e.time_out))} hrs
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <form
                            action={decideAsSupervisor}
                            className="inline-flex items-center gap-1.5"
                          >
                            <input type="hidden" name="entry_id" value={e.id} />
                            <Button
                              type="submit"
                              size="sm"
                              variant="blueOutline"
                              name="decision"
                              value="approved"
                            >
                              Approve
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              variant="ghost"
                              name="decision"
                              value="rejected"
                            >
                              Reject
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Evaluations + progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className={cn(CARD, "p-4")} id="evaluations">
              <h3 className={cn(TITLE, "mb-3")}>Intern evaluations</h3>
              {students.length === 0 ? (
                <EmptyState
                  title="No interns yet"
                  description="Evaluations appear here once students are placed at your company."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {students.map((s) => {
                    const done = evaluated.has(s.id);
                    return (
                      <li
                        key={s.id}
                        className="py-2.5 flex flex-wrap items-center justify-between gap-2 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            aria-hidden="true"
                            className="size-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0"
                          >
                            {initials(s.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {s.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-mono">{s.student_no}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill variant={done ? "approved" : "pending"}>
                            {done ? "Submitted" : "Not submitted"}
                          </Pill>
                          <Link
                            href={`/supervisor/evaluate/${s.id}`}
                            className={buttonVariants({
                              size: "sm",
                              variant: done ? "outline" : "default",
                            })}
                          >
                            {done ? "Edit" : "Evaluate"}
                          </Link>
                          {done && (
                            <Link
                              href={`/evaluations/${s.id}`}
                              className={buttonVariants({
                                size: "sm",
                                variant: "ghost",
                              })}
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className={cn(CARD, "p-4")} id="interns">
              <h3 className={cn(TITLE, "mb-3")}>Intern progress</h3>
              {students.length === 0 ? (
                <EmptyState
                  title="No interns yet"
                  description="Approved hours against the required hours will show here."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {students.map((s) => {
                    const approved = Number(s.approved_hours);
                    const required = Number(s.required_hours);
                    const waiting = Number(s.pending_count);
                    return (
                      <div key={s.id}>
                        <div className="flex items-center justify-between text-xs mb-1 gap-2">
                          <span className="font-medium text-foreground truncate">
                            {s.name}
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              {s.course}
                            </span>
                          </span>
                          <span className="font-mono text-muted-foreground shrink-0">
                            {formatHours(approved)} / {required}
                          </span>
                        </div>
                        <ProgressBar
                          value={approved}
                          max={required > 0 ? required : 1}
                          color="primary"
                          aria-label={`${s.name} approved hours`}
                        />
                        {waiting > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {waiting} {waiting === 1 ? "entry" : "entries"}{" "}
                            pending
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Journals (read only) */}
          {journal.length > 0 && (
            <div className={cn(CARD, "p-4")}>
              <h3 className={cn(TITLE, "mb-1")}>Student journals</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                The latest entries your students wrote about their days. You
                can read them; the school coordinator approves them.
              </p>
              <div className="flex flex-col gap-3">
                {journal.map((j) => (
                  <article
                    key={j.id}
                    className="flex flex-col gap-1 rounded-[8px] border border-border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {nameOf.get(j.student_id) ?? "A student"}{" "}
                        <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
                          {j.work_date}
                        </span>
                      </p>
                      <Pill
                        variant={
                          j.status === "approved"
                            ? "approved"
                            : j.status === "rejected"
                              ? "rejected"
                              : "pending"
                        }
                      >
                        {JOURNAL_STATUS_LABEL[j.status]}
                      </Pill>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{j.body}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Upheld reports */}
          {upheldReports.length > 0 && (
            <div className={cn(CARD, "p-4")}>
              <h3 className={cn(TITLE, "mb-1")}>
                Upheld reports about your company
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                A school coordinator reviewed these and upheld them. They do
                not say who raised them. Please make sure the work students do
                matches the tasks agreed with the school.
              </p>
              <div className="flex flex-col gap-3">
                {upheldReports.map((r) => {
                  const appeal = appealOf.get(r.id);
                  return (
                    <article
                      key={r.id}
                      className="flex flex-col gap-1 rounded-[8px] border border-border p-3"
                    >
                      <p className="text-sm font-medium">
                        {CATEGORY_LABEL[r.category] ?? r.category}{" "}
                        <span className="font-normal tabular-nums text-muted-foreground">
                          · {r.related_date} · {companyName[r.company_id] ?? "—"}
                        </span>
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {r.description}
                      </p>
                      {appeal ? (
                        <div>
                          <Pill variant="pending">
                            {APPEAL_STATUS_LABEL[appeal.status] ??
                              appeal.status}
                          </Pill>
                        </div>
                      ) : (
                        <details className="group">
                          <summary className="w-fit cursor-pointer list-none rounded-[8px] border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            Appeal this report
                          </summary>
                          <form
                            action={appealReport}
                            className="mt-3 flex flex-col gap-2"
                          >
                            <input type="hidden" name="report_id" value={r.id} />
                            <label
                              htmlFor={`reason-${r.id}`}
                              className="text-sm font-medium"
                            >
                              Why should this report not stand?
                            </label>
                            <textarea
                              id={`reason-${r.id}`}
                              name="reason"
                              required
                              minLength={10}
                              maxLength={2000}
                              rows={3}
                              className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              A Dugtong admin will decide. You can appeal a
                              report once, and the decision is final.
                            </p>
                            <div>
                              <Button type="submit" size="sm">
                                Send appeal
                              </Button>
                            </div>
                          </form>
                        </details>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appeals */}
          {appeals.length > 0 && (
            <div className={cn(CARD, "p-4")}>
              <h3 className={cn(TITLE, "mb-1")}>Your appeals</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                A Dugtong admin decides each appeal. If an appeal is granted,
                the report no longer counts against your company.
              </p>
              <div className="flex flex-col gap-3">
                {appeals.map((a) => (
                  <article
                    key={a.id}
                    className="flex flex-col gap-2 rounded-[8px] border border-border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {CATEGORY_LABEL[a.category] ?? a.category}{" "}
                        <span className="font-normal tabular-nums text-muted-foreground">
                          · {a.related_date}
                        </span>
                      </p>
                      <Pill
                        variant={
                          a.status === "granted"
                            ? "approved"
                            : a.status === "denied"
                              ? "rejected"
                              : "pending"
                        }
                      >
                        {APPEAL_STATUS_LABEL[a.status] ?? a.status}
                      </Pill>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {a.report_description}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">
                      <span className="font-medium">Your reason: </span>
                      {a.reason}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Aside */}
        <aside className="flex flex-col gap-6" id="attendance">
          <div className={cn(CARD, "p-4")}>
            <h3 className={cn(TITLE, "mb-3")}>Today&apos;s attendance</h3>
            {students.length === 0 ? (
              <EmptyState
                title="No interns yet"
                description="Today's time entries will show here."
              />
            ) : (
              <ul className="divide-y divide-border text-[13px]">
                {students.map((s) => {
                  const entry = todayOf.get(s.id);
                  return (
                    <li
                      key={s.id}
                      className="py-2.5 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          aria-hidden="true"
                          className="size-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0"
                        >
                          {initials(s.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {s.name}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {entry
                              ? `${shortTime(entry.time_in)} – ${shortTime(entry.time_out)}`
                              : "No entry yet"}
                          </div>
                        </div>
                      </div>
                      <Pill variant={entry ? "approved" : "neutral"}>
                        {entry ? "Logged" : "None"}
                      </Pill>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
