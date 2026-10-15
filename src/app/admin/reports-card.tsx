import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORY_LABEL } from "@/lib/reports";
import { decideAppeal, decideEscalatedReport, setCompanyReview } from "./actions";

export type EscalatedReportRow = {
  id: string;
  escalated_at: string;
  school_name: string;
  company_id: string;
  company_name: string;
  category: string;
  related_date: string;
  description: string;
};

export type AppealRow = {
  id: string;
  created_at: string;
  school_name: string;
  company_name: string;
  category: string;
  related_date: string;
  report_description: string;
  reason: string;
};

export type FlaggedCompanyRow = {
  company_id: string;
  company_name: string;
  school_name: string;
  review_state: "flagged" | "under_review";
  review_changed_at: string | null;
  upheld_count: number;
  reports: { category: string; related_date: string; description: string }[];
};

// The two things a Dugtong admin does about misuse reports: decide the ones
// a coordinator escalated, and look at companies that keep being reported.
// Admins never see which student filed a report.
export function ReportsCard({
  escalated,
  flagged,
  appeals,
}: {
  escalated: EscalatedReportRow[];
  flagged: FlaggedCompanyRow[];
  appeals: AppealRow[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Escalated reports</CardTitle>
          <CardDescription>
            A school coordinator could not resolve these. Your decision is
            final. If you uphold a report, the supervisor at that company can
            read it. Students are never shown to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {escalated.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports are waiting for you.
            </p>
          ) : (
            escalated.map((r) => (
              <article
                key={r.id}
                className="flex flex-col gap-3 rounded-[8px] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {CATEGORY_LABEL[r.category] ?? r.category}
                  </p>
                  <Badge variant="escalated">Escalated</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.company_name} · {r.school_name} · Day{" "}
                  <span className="font-mono tabular-nums">
                    {r.related_date}
                  </span>
                </p>
                <p className="whitespace-pre-wrap text-sm">{r.description}</p>
                <form
                  action={decideEscalatedReport}
                  className="flex flex-wrap gap-2"
                >
                  <input type="hidden" name="report_id" value={r.id} />
                  <Button type="submit" name="decision" value="upheld">
                    Uphold
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    name="decision"
                    value="not_upheld"
                  >
                    Do not uphold
                  </Button>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Appeals from companies</CardTitle>
          <CardDescription>
            A company&apos;s supervisor disagrees with a report the school
            upheld. Your decision is final. If you grant the appeal, the
            report is no longer upheld. Students are never shown to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {appeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No appeals are waiting for you.
            </p>
          ) : (
            appeals.map((a) => (
              <article
                key={a.id}
                className="flex flex-col gap-3 rounded-[8px] border border-border p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {a.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.school_name} · {CATEGORY_LABEL[a.category] ?? a.category} ·{" "}
                    <span className="font-mono tabular-nums">
                      {a.related_date}
                    </span>
                  </p>
                </div>
                <div className="border-l-2 border-border pl-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    What the student reported
                  </p>
                  <p className="whitespace-pre-wrap">{a.report_description}</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    The company&apos;s reason
                  </p>
                  <p className="whitespace-pre-wrap">{a.reason}</p>
                </div>
                <form action={decideAppeal} className="flex flex-wrap gap-2">
                  <input type="hidden" name="appeal_id" value={a.id} />
                  <Button type="submit" name="decision" value="granted">
                    Grant appeal
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    name="decision"
                    value="denied"
                  >
                    Deny appeal
                  </Button>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Repeatedly reported companies</CardTitle>
          <CardDescription>
            A company is flagged when 3 reports about it have been upheld. Mark
            it under review while you look into it, or restore it. After a
            restore, only reports upheld later count towards the next flag.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No company has been flagged.
            </p>
          ) : (
            flagged.map((c) => (
              <article
                key={c.company_id}
                className="flex flex-col gap-3 rounded-[8px] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {c.company_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.school_name} ·{" "}
                      <span className="font-mono tabular-nums">
                        {Number(c.upheld_count)}
                      </span>{" "}
                      upheld {Number(c.upheld_count) === 1 ? "report" : "reports"}
                    </p>
                  </div>
                  {c.review_state === "under_review" ? (
                    <Badge variant="pending">Under review</Badge>
                  ) : (
                    <Badge variant="rejected">Flagged</Badge>
                  )}
                </div>

                <ul className="flex flex-col gap-2">
                  {c.reports.map((r, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-border pl-3 text-sm"
                    >
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABEL[r.category] ?? r.category} ·{" "}
                        <span className="font-mono tabular-nums">
                          {r.related_date}
                        </span>
                      </p>
                      <p className="whitespace-pre-wrap">{r.description}</p>
                    </li>
                  ))}
                </ul>

                <form action={setCompanyReview} className="flex flex-wrap gap-2">
                  <input type="hidden" name="company_id" value={c.company_id} />
                  {c.review_state === "flagged" && (
                    <Button
                      type="submit"
                      size="sm"
                      name="state"
                      value="under_review"
                    >
                      Mark under review
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    name="state"
                    value="none"
                  >
                    Restore company
                  </Button>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
