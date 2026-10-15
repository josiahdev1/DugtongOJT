import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  APPEAL_STATUS_LABEL,
  CATEGORY_LABEL,
  REPORT_STATUS_LABEL,
} from "@/lib/reports";
import { decideReport, escalateReport } from "./actions";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");

  const [
    { data: reports },
    { data: students },
    { data: companies },
    { data: appeals },
  ] = await Promise.all([
      supabase
        .from("reports")
        .select(
          "id, created_at, student_id, company_id, category, related_date, description, status, decided_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("students").select("id, name, student_no"),
    supabase.from("companies").select("id, name, review_state"),
    // A company can appeal an upheld report; a Dugtong admin decides.
    supabase.from("report_appeals").select("report_id, status"),
  ]);
  const appealOf = new Map((appeals ?? []).map((a) => [a.report_id, a.status]));

  const studentOf = new Map((students ?? []).map((s) => [s.id, s]));
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  // A company a Dugtong admin is looking into gets a badge wherever it shows.
  const underReview = new Set(
    (companies ?? [])
      .filter((c) => c.review_state === "under_review")
      .map((c) => c.id),
  );
  const waiting = (reports ?? []).filter((r) => r.status === "submitted");
  const escalated = (reports ?? []).filter((r) => r.status === "escalated");
  const decided = (reports ?? []).filter(
    (r) => r.status === "upheld" || r.status === "not_upheld",
  );

  return (
    <AppShell
      role="coordinator"
      active="reports"
      title="Misuse reports"
      description="What students reported about their placements. Your decision on each report is final, or you can escalate it to Dugtong."
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
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
        <CardHeader>
          <CardTitle>Reports waiting for your decision</CardTitle>
          <CardDescription>
            You can see which student filed each report. Your decision is
            final. If you uphold a report, the supervisor at that company can
            read it, without the student&apos;s name. A report you do not
            uphold is never shown to the company. If you cannot resolve a
            report, escalate it: a Dugtong admin decides it and you can no
            longer change it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {waiting.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports are waiting.
            </p>
          ) : (
            waiting.map((r) => (
              <article
                key={r.id}
                className="flex flex-col gap-3 rounded-[var(--radius)] border border-border p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {CATEGORY_LABEL[r.category] ?? r.category}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    Day: {r.related_date}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  From{" "}
                  <Link
                    href={`/students/${r.student_id}`}
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    {studentOf.get(r.student_id)?.name ?? "a student"}
                  </Link>{" "}
                  · {companyName.get(r.company_id) ?? "—"}{" "}
                  {underReview.has(r.company_id) && (
                    <Badge variant="pending">Under review</Badge>
                  )}
                </p>
                <p className="whitespace-pre-wrap text-sm">{r.description}</p>
                <form action={decideReport} className="flex flex-wrap gap-2">
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
                  <Button
                    type="submit"
                    variant="secondary"
                    formAction={escalateReport}
                  >
                    Escalate to Dugtong
                  </Button>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      {escalated.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Escalated to Dugtong</CardTitle>
            <CardDescription>
              A Dugtong admin is deciding these. You will see the decision under
              Decided reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {escalated.map((r) => (
              <article
                key={r.id}
                className="flex flex-col gap-2 rounded-[var(--radius)] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {CATEGORY_LABEL[r.category] ?? r.category}
                  </p>
                  <Badge variant="escalated">Escalated</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  From {studentOf.get(r.student_id)?.name ?? "a student"} ·{" "}
                  {companyName.get(r.company_id) ?? "—"}{" "}
                  {underReview.has(r.company_id) && (
                    <Badge variant="pending">Under review</Badge>
                  )}
                </p>
                <p className="whitespace-pre-wrap text-sm">{r.description}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Decided reports</CardTitle>
        </CardHeader>
        <CardContent>
          {decided.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing decided yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">Student</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">What happened</th>
                    <th className="px-3 py-2 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {decided.map((r) => (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 tabular-nums">{r.related_date}</td>
                      <td className="px-3 py-2">
                        {studentOf.get(r.student_id)?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {companyName.get(r.company_id) ?? "—"}{" "}
                        {underReview.has(r.company_id) && (
                          <Badge variant="pending">Under review</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {CATEGORY_LABEL[r.category] ?? r.category}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={r.status === "upheld" ? "approved" : "secondary"}
                        >
                          {REPORT_STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                        {appealOf.has(r.id) && (
                          <>
                            {" "}
                            <Badge variant="pending">
                              {APPEAL_STATUS_LABEL[appealOf.get(r.id)!]}
                            </Badge>
                          </>
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
    </AppShell>
  );
}
