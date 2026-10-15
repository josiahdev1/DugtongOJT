import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { findStudent, getCurrentUser } from "@/lib/auth";
import {
  MAX_DAYS_BACK,
  formatHours,
  hoursBetween,
  shiftDate,
  shortTime,
  todayInManila,
} from "@/lib/time";
import { LogForm } from "./log-form";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

export default async function MyHoursPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (school) redirect("/dashboard"); // coordinators have their own page

  const student = await findStudent(supabase);
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

  const pendingHours = (entries ?? [])
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + hoursBetween(e.time_in, e.time_out), 0);

  const today = todayInManila();

  return (
    <AppShell
      role="student"
      active="hours"
      title="My hours"
      description={`${student.course} · ${company?.name ?? "No company"} · ${student.student_no}`}
      user={user}
    >
      {/* Progress & Summary Card */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Approved progress</CardTitle>
            <Badge variant="trust">
              {Math.round((approvedHours / student.required_hours) * 100)}% Complete
            </Badge>
          </div>
          <CardDescription>
            Only hours your coordinator has verified and approved count toward your requirement.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-medium tabular-nums text-foreground">
              {formatHours(approvedHours)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                of {student.required_hours} hours required
              </span>
            </p>
            {pendingHours > 0 && (
              <span className="text-xs text-warning-text font-medium">
                +{formatHours(pendingHours)} pending approval
              </span>
            )}
          </div>
          <Progress
            aria-label="Approved hours toward your requirement"
            value={approvedHours}
            max={student.required_hours}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Log Hours Form Card */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Log a day</CardTitle>
          <CardDescription>
            Record your shift for today or up to {MAX_DAYS_BACK} days back.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <LogForm
            today={today}
            earliest={shiftDate(today, -MAX_DAYS_BACK)}
          />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Something wrong at your placement, like being asked to do work outside
        what was agreed?{" "}
        <Link
          href="/report"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Report a problem
        </Link>
        .
      </p>

      {/* Time Entries Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle>Your entries</CardTitle>
          <CardDescription>
            History of all your submitted daily time entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!entries || entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nothing logged yet. Submit your first entry above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time in</TableHead>
                  <TableHead>Time out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs tabular-nums text-foreground">
                      {e.work_date}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {shortTime(e.time_in)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {shortTime(e.time_out)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium tabular-nums text-foreground">
                      {formatHours(hoursBetween(e.time_in, e.time_out))} hrs
                    </TableCell>
                    <TableCell className="text-right">
                      {e.status === "approved" ? (
                        <Badge variant="approved">Approved</Badge>
                      ) : e.status === "pending" ? (
                        <Badge variant="pending">Pending</Badge>
                      ) : e.status === "rejected" ? (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="rejected">Rejected</Badge>
                          <span className="text-[11px] text-muted-foreground">
                            Resubmit via log form
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary">{e.status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
