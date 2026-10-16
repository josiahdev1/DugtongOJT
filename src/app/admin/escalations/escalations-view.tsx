"use client";

import { useState } from "react";
import {
  ChevronRight,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABEL } from "@/lib/reports";
import { decideAppeal, decideEscalatedReport, setCompanyReview } from "../actions";
import type { AppealRow, EscalatedReportRow, FlaggedCompanyRow } from "../reports-card";

export function EscalationsView({
  escalated,
  flagged,
  appeals,
}: {
  escalated: EscalatedReportRow[];
  flagged: FlaggedCompanyRow[];
  appeals: AppealRow[];
}) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    escalated[0]?.id || appeals[0]?.id || null
  );

  const selectedReport = escalated.find((r) => r.id === selectedReportId);
  const selectedAppeal = appeals.find((a) => a.id === selectedReportId);

  const totalReportsCount = escalated.length + appeals.length + flagged.length;

  if (totalReportsCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-xs">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-primary-soft">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          No open escalations
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          There are currently no unresolved student safety reports, appeals, or flagged companies requiring administrator review.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[6fr_4fr]">
      {/* LEFT: LIST OF REPORTS & APPEALS */}
      <div className="flex flex-col gap-4">
        {/* Escalated Student Reports */}
        <Card className="rounded-2xl border border-border bg-card shadow-xs">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Escalated reports ({escalated.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Misuse reports escalated by school coordinators
                </p>
              </div>
              {escalated.length > 0 && (
                <Badge variant="escalated">
                  {escalated.length} urgent
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 p-6 pt-0">
            {escalated.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No reports currently escalated.
              </p>
            ) : (
              escalated.map((r) => {
                const isSelected = selectedReportId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-foreground">
                          ID: {r.id.slice(0, 8)}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_LABEL[r.category] ?? r.category}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium text-sm text-foreground truncate">
                        {r.company_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.school_name} · Incident date {r.related_date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        Escalated
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Pending Appeals */}
        {appeals.length > 0 && (
          <Card className="rounded-2xl border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-semibold text-foreground">
                Company appeals ({appeals.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Formal appeals filed against coordinator determinations
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 p-6 pt-0">
              {appeals.map((a) => {
                const isSelected = selectedReportId === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedReportId(a.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-foreground">
                          Appeal: {a.id.slice(0, 8)}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_LABEL[a.category] ?? a.category}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium text-sm text-foreground truncate">
                        {a.company_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Filed {a.created_at.slice(0, 10)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning-text">
                        Under appeal
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Flagged Companies */}
        {flagged.length > 0 && (
          <Card className="rounded-2xl border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-semibold text-foreground">
                Flagged companies ({flagged.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Partners with repeated upheld reports requiring administrative review
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 pt-0">
              {flagged.map((c) => (
                <div
                  key={c.company_id}
                  className="flex flex-col gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{c.company_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.school_name} · {c.upheld_count} upheld reports
                      </p>
                    </div>
                    <Badge variant="escalated">Flagged</Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <form action={setCompanyReview}>
                      <input type="hidden" name="return_to" value="/admin/escalations" />
                      <input type="hidden" name="company_id" value={c.company_id} />
                      <input
                        type="hidden"
                        name="state"
                        value={c.review_state === "flagged" ? "under_review" : "none"}
                      />
                      <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
                        {c.review_state === "flagged" ? "Mark under review" : "Restore company"}
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT RAIL: DETAILS INSPECTION PANEL */}
      <div className="sticky top-20 self-start">
        <Card className="rounded-2xl border border-border bg-card shadow-xs">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <CardTitle className="text-base font-semibold text-foreground">
              Inspection details
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {selectedReport
                ? `Report ID: ${selectedReport.id}`
                : selectedAppeal
                  ? `Appeal ID: ${selectedAppeal.id}`
                  : "Select an item to view incident details"}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {selectedReport ? (
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                    Incident description
                  </span>
                  <div className="mt-2 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-muted-foreground">Category</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {CATEGORY_LABEL[selectedReport.category] ?? selectedReport.category}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-muted-foreground">Incident date</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {selectedReport.related_date}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-muted-foreground">School</p>
                    <p className="mt-1 font-semibold text-foreground truncate">
                      {selectedReport.school_name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-muted-foreground">Company</p>
                    <p className="mt-1 font-semibold text-foreground truncate">
                      {selectedReport.company_name}
                    </p>
                  </div>
                </div>

                {/* Final administrative actions */}
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <span className="text-xs font-medium text-foreground">
                    Make final administrative decision:
                  </span>
                  <div className="flex items-center gap-2">
                    <form action={decideEscalatedReport} className="flex-1">
                      <input type="hidden" name="return_to" value="/admin/escalations" />
                      <input type="hidden" name="report_id" value={selectedReport.id} />
                      <input type="hidden" name="decision" value="upheld" />
                      <Button type="submit" size="sm" className="w-full h-9 text-xs">
                        Uphold report
                      </Button>
                    </form>
                    <form action={decideEscalatedReport} className="flex-1">
                      <input type="hidden" name="return_to" value="/admin/escalations" />
                      <input type="hidden" name="report_id" value={selectedReport.id} />
                      <input type="hidden" name="decision" value="not_upheld" />
                      <Button type="submit" size="sm" variant="outline" className="w-full h-9 text-xs">
                        Dismiss
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ) : selectedAppeal ? (
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                    Appeal grounds & justification
                  </span>
                  <div className="mt-2 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">
                    {selectedAppeal.reason}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                    Original report statement
                  </span>
                  <div className="mt-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
                    {selectedAppeal.report_description}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <form action={decideAppeal} className="flex-1">
                    <input type="hidden" name="return_to" value="/admin/escalations" />
                    <input type="hidden" name="appeal_id" value={selectedAppeal.id} />
                    <input type="hidden" name="decision" value="granted" />
                    <Button type="submit" size="sm" className="w-full h-9 text-xs">
                      Grant appeal
                    </Button>
                  </form>
                  <form action={decideAppeal} className="flex-1">
                    <input type="hidden" name="return_to" value="/admin/escalations" />
                    <input type="hidden" name="appeal_id" value={selectedAppeal.id} />
                    <input type="hidden" name="decision" value="denied" />
                    <Button type="submit" size="sm" variant="outline" className="w-full h-9 text-xs">
                      Deny appeal
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                <FileText className="size-8 text-muted-foreground/40 mb-2" />
                Select a report from the list on the left to inspect full details and submit decisions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
