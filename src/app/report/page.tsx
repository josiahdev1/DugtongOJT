import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findStudent, getCurrentUser } from "@/lib/auth";
import {
  CATEGORY_LABEL,
  REPORT_MAX_DAYS_BACK,
  REPORT_STATUS_LABEL,
} from "@/lib/reports";
import { shiftDate, todayInManila } from "@/lib/time";
import { ReportForm } from "./report-form";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) redirect("/dashboard");

  const student = await findStudent(supabase);
  if (!student) redirect("/");

  // Row Level Security returns only THIS student's own reports.
  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, category, related_date, status")
    .order("created_at", { ascending: false });

  const today = todayInManila();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/my-hours"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← My hours
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Report a problem</CardTitle>
          <CardDescription>
            Were you asked to do work outside what was agreed, put in unsafe
            conditions, or made to work extra hours that were not recorded?
            Tell your school coordinator. Only your coordinator can see that
            it came from you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm
            today={today}
            earliest={shiftDate(today, -REPORT_MAX_DAYS_BACK)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your reports</CardTitle>
        </CardHeader>
        <CardContent>
          {!reports || reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have not sent any reports.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">What happened</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">{r.related_date}</td>
                      <td className="px-3 py-2">
                        {CATEGORY_LABEL[r.category] ?? r.category}
                      </td>
                      <td className="px-3 py-2">
                        {REPORT_STATUS_LABEL[r.status] ?? r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
