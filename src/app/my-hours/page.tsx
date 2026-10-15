import { redirect } from "next/navigation";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { MAX_DAYS_BACK, hoursBetween, shiftDate, todayInManila } from "@/lib/time";
import { AppShell } from "@/components/app-shell/app-shell";
import { AttendanceClient, type EntryRow } from "./attendance-client";

export const dynamic = "force-dynamic";

export default async function MyHoursPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (school) redirect("/dashboard"); // coordinators have their own page

  const student = await findStudent(supabase);
  if (!student) redirect("/"); // not on a roster

  const [{ data: company }, { data: entries }, { data: certificateRows }] =
    await Promise.all([
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
      // Their own completion certificate, once the coordinator issued it.
      supabase.rpc("my_certificate"),
    ]);

  const rows: EntryRow[] = (entries ?? []).map((e) => ({
    id: e.id,
    workDate: e.work_date,
    timeIn: e.time_in,
    timeOut: e.time_out,
    status: e.status,
    hours: hoursBetween(e.time_in, e.time_out),
  }));

  // Totals are added up on the server from the database rows.
  const sumBy = (status: string) =>
    rows.filter((r) => r.status === status).reduce((s, r) => s + r.hours, 0);

  const today = todayInManila();

  return (
    <AppShell
      role="student"
      active="hours"
      title="My hours"
      description={`${student.course} · ${company?.name ?? "No company"} · ${student.student_no}`}
      user={user}
    >
      <AttendanceClient
        companyName={company?.name ?? "No company"}
        approvedHours={sumBy("approved")}
        pendingHours={sumBy("pending")}
        requiredHours={student.required_hours}
        entries={rows}
        hasCertificate={((certificateRows ?? []) as unknown[]).length > 0}
        today={today}
        earliest={shiftDate(today, -MAX_DAYS_BACK)}
        maxDaysBack={MAX_DAYS_BACK}
      />
    </AppShell>
  );
}
