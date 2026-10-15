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
import {
  MAX_DAYS_BACK,
  formatHours,
  hoursBetween,
  shiftDate,
  shortTime,
  todayInManila,
} from "@/lib/time";
import { signOut } from "../login/actions";
import { LogForm } from "./log-form";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function MyHoursPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (school) redirect("/dashboard"); // coordinators have their own page

  // Row Level Security hands back only THIS student's roster row (matched
  // by their verified email). Nothing comes back for anyone not on a roster.
  const { data: student } = await supabase
    .from("students")
    .select("id, name, student_no, course, company_id, required_hours")
    .limit(1)
    .maybeSingle();
  if (!student) redirect("/"); // not on a roster

  const [{ data: company }, { data: entries }] = await Promise.all([
    supabase
      .from("companies")
      .select("name")
      .eq("id", student.company_id)
      .maybeSingle(),
    supabase
      .from("time_entries")
      .select("id, work_date, time_in, time_out, status")
      .eq("student_id", student.id)
      .order("work_date", { ascending: false }),
  ]);

  // The approved total is added up here on the server, from the database
  // rows, so it can never be a number the browser made up.
  const approvedHours = (entries ?? [])
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + hoursBetween(e.time_in, e.time_out), 0);

  const today = todayInManila();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {student.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {student.course} · {company?.name ?? "No company"} ·{" "}
            <span className="font-mono text-xs">{student.student_no}</span>
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Approved hours</CardTitle>
          <CardDescription>
            Only hours your coordinator has approved count.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-semibold tabular-nums">
            {formatHours(approvedHours)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              of {student.required_hours} hours
            </span>
          </p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary"
            value={Math.min(approvedHours, student.required_hours)}
            max={student.required_hours}
            aria-label="Approved hours progress"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log a day</CardTitle>
          <CardDescription>
            Today or up to {MAX_DAYS_BACK} days back. One entry per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogForm
            today={today}
            earliest={shiftDate(today, -MAX_DAYS_BACK)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your entries</CardTitle>
        </CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing logged yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 tabular-nums">{e.work_date}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_in)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {shortTime(e.time_out)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(hoursBetween(e.time_in, e.time_out))}
                      </td>
                      <td className="px-3 py-2">
                        {STATUS_LABEL[e.status] ?? e.status}
                        {e.status === "rejected" && (
                          <span className="block text-xs text-muted-foreground">
                            Log this day again to fix and resubmit it.
                          </span>
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
    </main>
  );
}
