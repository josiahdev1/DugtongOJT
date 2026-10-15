"use client";

import { useState } from "react";
import {
  Button,
  KpiCard,
  Pill,
  ProgressBar,
  RatingSegment,
} from "@/components/ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type JournalRow = {
  id: string;
  intern: string;
  date: string;
  hours: number;
  summary: string;
  status: "pending" | "approved" | "rejected";
  timeCategory: "today" | "late";
};

const INITIAL_JOURNALS: JournalRow[] = [
  {
    id: "j-1",
    intern: "Maria Santos",
    date: "Oct 13",
    hours: 8,
    summary: "Wired the attendance table filters",
    status: "pending",
    timeCategory: "today",
  },
  {
    id: "j-2",
    intern: "Kristine Lopez",
    date: "Oct 13",
    hours: 8,
    summary: "Wrote unit tests for the login form",
    status: "pending",
    timeCategory: "today",
  },
  {
    id: "j-3",
    intern: "Maria Santos",
    date: "Oct 12",
    hours: 8,
    summary: "Responsive layout for the reports page",
    status: "pending",
    timeCategory: "late",
  },
  {
    id: "j-4",
    intern: "Paolo Reyes",
    date: "Oct 11",
    hours: 6,
    summary: "Reviewed API documentation",
    status: "pending",
    timeCategory: "late",
  },
  {
    id: "j-5",
    intern: "Kristine Lopez",
    date: "Oct 12",
    hours: 8,
    summary: "Fixed form validation bugs",
    status: "approved",
    timeCategory: "late",
  },
];

const INITIAL_TASKS = [
  { id: "t1", text: "Set up project repository", done: true },
  { id: "t2", text: "Build responsive pages in React", done: true },
  { id: "t3", text: "Integrate attendance REST API", done: false },
  { id: "t4", text: "Write unit tests and weekly report", done: false },
];

export function SupervisorWorkspaceClient({
  initialJournals = INITIAL_JOURNALS,
}: {
  initialJournals?: JournalRow[];
}) {
  const [journals, setJournals] = useState<JournalRow[]>(initialJournals);
  const [filter, setFilter] = useState<"all" | "today" | "late">("all");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [ratings, setRatings] = useState({
    punctuality: 4,
    quality: 5,
    initiative: 3,
    teamwork: 4,
  });
  const [remarks, setRemarks] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredJournals = journals.filter((j) => {
    if (filter === "all") return true;
    if (filter === "today") return j.timeCategory === "today";
    if (filter === "late") return j.timeCategory === "late";
    return true;
  });

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setJournals((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: decision } : j))
    );
    showToast(`Journal ${decision === "approved" ? "approved" : "rejected"} successfully`);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingCount = journals.filter((j) => j.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-4 shadow-lg text-sm text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <Check className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2-Column Main Layout: Left side content (minmax(0,1fr)), Right aside (292px) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_292px] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* KPI Row (4 KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Active interns"
              value={12}
              subtitle="3 finishing this month"
            />
            <KpiCard
              label="Journals to approve"
              value={pendingCount}
              trend="↑ 3 since yesterday"
              trendDirection="down"
            />
            <KpiCard
              label="Evaluations due"
              value={3}
              subtitle="Next: Oct 18"
            />
            <KpiCard
              label="Hours this week"
              value="412"
              trend="↑ 2.4%"
              trendDirection="up"
            />
          </div>

          {/* Journal Approvals Card */}
          <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden" id="journals">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
              <h2 className="text-[15px] font-medium leading-5 text-foreground">
                Journal approvals
              </h2>
              {/* Filter Tabs */}
              <div className="inline-flex rounded-[8px] bg-surface p-0.5" role="tablist">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
                    filter === "all"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("today")}
                  className={cn(
                    "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
                    filter === "today"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("late")}
                  className={cn(
                    "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
                    filter === "late"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Overdue
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface text-[12px] text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-3 py-2 font-medium">Intern</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Summary</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No journals in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredJournals.map((j) => (
                      <tr key={j.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                          {j.intern}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {j.date}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">
                          {j.hours} hrs
                        </td>
                        <td className="px-3 py-2.5 text-foreground max-w-[280px] truncate">
                          {j.summary}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Pill variant={j.status}>
                            {j.status === "approved"
                              ? "Approved"
                              : j.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                          </Pill>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {j.status === "pending" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="blueOutline"
                                onClick={() => handleDecision(j.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDecision(j.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subgrid: Intern evaluation + Scope of work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Card 1: Intern evaluation */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm" id="evaluations">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
                Intern evaluation
              </h3>
              {/* Intern Info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="size-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                  KL
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">Kristine Lopez</div>
                  <div className="text-xs text-muted-foreground">
                    Midterm · <span className="font-mono">OJT-2026-00167</span>
                  </div>
                </div>
              </div>

              {/* 4 Rating Segments */}
              <div className="flex flex-col gap-3">
                <RatingSegment
                  label="Punctuality"
                  value={ratings.punctuality}
                  onChange={(v) => setRatings((p) => ({ ...p, punctuality: v }))}
                />
                <RatingSegment
                  label="Quality of work"
                  value={ratings.quality}
                  onChange={(v) => setRatings((p) => ({ ...p, quality: v }))}
                />
                <RatingSegment
                  label="Initiative"
                  value={ratings.initiative}
                  onChange={(v) => setRatings((p) => ({ ...p, initiative: v }))}
                />
                <RatingSegment
                  label="Teamwork"
                  value={ratings.teamwork}
                  onChange={(v) => setRatings((p) => ({ ...p, teamwork: v }))}
                />
              </div>

              {/* Remarks */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Supervisor remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Strengths, areas to improve"
                  rows={2}
                  className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast("Evaluation draft saved")}
                >
                  Save draft
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    showToast("Evaluation submitted for Kristine Lopez");
                    setRemarks("");
                  }}
                >
                  Submit evaluation
                </Button>
              </div>
            </div>

            {/* Card 2: Scope of work · Web Dev Intern */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm" id="interns">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
                Scope of work · Web Dev Intern
              </h3>

              {/* Checklist */}
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 text-sm cursor-pointer select-none py-1 group"
                  >
                    <span
                      className={cn(
                        "size-[18px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0",
                        task.done
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground/30 group-hover:border-primary"
                      )}
                    >
                      {task.done && <Check className="size-3 stroke-[2.5]" />}
                    </span>
                    <span
                      className={cn(
                        task.done ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                    >
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Acknowledged by 3 of 3 interns
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button variant="blueOutline" size="sm">
                  Edit scope
                </Button>
                <Button variant="ghost" size="sm">
                  Version history
                </Button>
              </div>

              {/* Intern progress section */}
              <h4 className="mt-5 mb-3 text-[14px] font-medium text-foreground">
                Intern progress
              </h4>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">Maria Santos</span>
                    <span className="font-mono text-muted-foreground">320 / 486</span>
                  </div>
                  <ProgressBar value={320} max={486} color="primary" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">Kristine Lopez</span>
                    <span className="font-mono text-muted-foreground">380 / 486</span>
                  </div>
                  <ProgressBar value={380} max={486} color="primary" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">Paolo Reyes</span>
                    <span className="font-mono text-muted-foreground">53 / 240</span>
                  </div>
                  <ProgressBar value={53} max={240} color="warning" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aside: 292px */}
        <aside className="flex flex-col gap-6" id="attendance">
          {/* Today's Attendance */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
              Today&apos;s attendance
            </h3>
            <div className="divide-y divide-border text-[13px]">
              <div className="py-2.5 flex items-center justify-between gap-2 first:pt-0">
                <div className="flex items-center gap-2.5">
                  <span className="size-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                    MS
                  </span>
                  <div>
                    <div className="font-medium text-foreground">Maria Santos</div>
                    <div className="text-xs text-muted-foreground">In 8:02 AM</div>
                  </div>
                </div>
                <Pill variant="approved">On time</Pill>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="size-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                    KL
                  </span>
                  <div>
                    <div className="font-medium text-foreground">Kristine Lopez</div>
                    <div className="text-xs text-muted-foreground">In 8:41 AM</div>
                  </div>
                </div>
                <Pill variant="pending">Late</Pill>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="size-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                    PR
                  </span>
                  <div>
                    <div className="font-medium text-foreground">Paolo Reyes</div>
                    <div className="text-xs text-muted-foreground">No time-in yet</div>
                  </div>
                </div>
                <Pill variant="rejected">Absent</Pill>
              </div>
            </div>
          </div>

          {/* Upcoming Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
              Upcoming
            </h3>
            <div className="divide-y divide-border text-[13px]">
              <div className="py-2.5 flex items-start gap-3 first:pt-0">
                <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground leading-tight">
                    Midterm evaluation, K. Lopez
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Oct 18</div>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-3">
                <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground leading-tight">
                    MOA renewal review
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Nov 02</div>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-3 last:pb-0">
                <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground leading-tight">
                    Final report due, A. Villanueva
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Nov 09</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
