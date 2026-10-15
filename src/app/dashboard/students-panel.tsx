"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatHours } from "@/lib/time";

export type StudentRow = {
  id: string;
  name: string;
  studentNo: string;
  course: string;
  company: string;
  approved: number;
  required: number;
  pending: number;
};

type Tab = "all" | "waiting" | "completed";

// Students shown per page. Search and the tabs look through all of them.
const PAGE_SIZE = 25;

const EMPTY: Record<Tab, string> = {
  all: "No student matches that search.",
  waiting: "Nobody has hours waiting for approval.",
  completed: "Nobody has reached their required hours yet.",
};

// The coordinator's student list: filter by what needs attention, and
// search by name, student ID, course or company. All the rows are already on
// the page, so filtering is instant, and the list is shown a page at a time.
export function StudentsPanel({ rows }: { rows: StudentRow[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const isComplete = (r: StudentRow) => r.approved >= r.required;
  const counts = {
    all: rows.length,
    waiting: rows.filter((r) => r.pending > 0).length,
    completed: rows.filter(isComplete).length,
  };

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => {
    if (tab === "waiting" && r.pending === 0) return false;
    if (tab === "completed" && !isComplete(r)) return false;
    if (!q) return true;
    return [r.name, r.studentNo, r.course, r.company].some((v) =>
      v.toLowerCase().includes(q),
    );
  });

  // Stay on a page that exists when the filters shrink the list.
  const lastPage = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, lastPage);
  const start = (current - 1) * PAGE_SIZE;
  const visible = shown.slice(start, start + PAGE_SIZE);

  const pager =
    shown.length > PAGE_SIZE ? (
      <nav
        aria-label="Student list pages"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3"
      >
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing{" "}
          <span className="font-mono tabular-nums">
            {start + 1}–{Math.min(start + PAGE_SIZE, shown.length)}
          </span>{" "}
          of <span className="font-mono tabular-nums">{shown.length}</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current === lastPage}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </nav>
    ) : null;

  const results = (
shown.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          {EMPTY[tab]}
        </p>
      ) : (
        <>
          {/* Phones: one student per row. A wide table cannot fit at 390px. */}
          <ul className="divide-y divide-border md:hidden">
            {visible.map((r) => {
              const percent = Math.min(100, Math.round((r.approved / r.required) * 100));
              return (
                <li key={r.id}>
                  <Link
                    href={`/students/${r.id}`}
                    className="flex flex-col gap-2.5 p-4 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{r.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-mono">{r.studentNo}</span> · {r.course}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.company}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {isComplete(r) && <Badge variant="approved">Completed</Badge>}
                        {r.pending > 0 && <Badge variant="pending">{r.pending} pending</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={r.approved}
                        max={r.required}
                        aria-label={`${r.name}: ${percent}% of required hours approved`}
                        indicatorColor={isComplete(r) ? "bg-success" : undefined}
                        className="h-1.5 flex-1"
                      />
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground">{formatHours(r.approved)}</span>
                        {" / "}
                        {r.required}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="hidden 2xl:table-cell">Company</TableHead>
              <TableHead className="w-48">Approved hours</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => {
              const percent = Math.min(100, Math.round((r.approved / r.required) * 100));
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/students/${r.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:text-primary-text hover:underline"
                    >
                      {r.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">{r.studentNo}</span> · {r.course}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground 2xl:hidden">{r.company}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground 2xl:table-cell">
                    {r.company}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={r.approved}
                        max={r.required}
                        aria-label={`${r.name}: ${percent}% of required hours approved`}
                        indicatorColor={isComplete(r) ? "bg-success" : undefined}
                        className="h-1.5 w-20"
                      />
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatHours(r.approved)}
                        </span>
                        {" / "}
                        {r.required}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isComplete(r) && <Badge variant="approved">Completed</Badge>}
                      {r.pending > 0 && (
                        <Badge variant="pending">{r.pending} pending</Badge>
                      )}
                      <Link
                        href={`/students/${r.id}`}
                        aria-label={`Review ${r.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
          </div>
        </>
      )
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v as Tab);
        setPage(1);
      }}
      className="gap-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="waiting">Waiting ({counts.waiting})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
        </TabsList>
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search students"
            aria-label="Search students"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
      </div>

      {(["all", "waiting", "completed"] as Tab[]).map((v) => (
        <TabsContent key={v} value={v} className="mt-0">
          {results}
          {pager}
        </TabsContent>
      ))}
    </Tabs>
  );
}
