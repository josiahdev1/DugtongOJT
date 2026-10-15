import { findStudent, getCurrentUser } from "@/lib/auth";
import { hoursBetween } from "@/lib/time";
import { AppShell } from "@/components/app-shell/app-shell";
import { AttendanceClient } from "./attendance-client";

export const dynamic = "force-dynamic";

export default async function MyHoursPage() {
  const { user, supabase } = await getCurrentUser();

  let student = null;
  let companyName = "Iloilo IT Solutions Inc.";
  let approvedHours = 320;
  let requiredHours = 486;

  if (user && supabase) {
    try {
      student = await findStudent(supabase);
      if (student) {
        requiredHours = student.required_hours;
        const [{ data: company }, { data: entries }] = await Promise.all([
          supabase
            .from("companies")
            .select("name")
            .eq("id", student.company_id)
            .maybeSingle(),
          supabase
            .from("time_entries")
            .select("id, work_date, time_in, time_out, status")
            .eq("student_id", student.id),
        ]);

        if (company?.name) companyName = company.name;
        if (entries && entries.length > 0) {
          approvedHours = entries
            .filter((e) => e.status === "approved")
            .reduce((sum, e) => sum + hoursBetween(e.time_in, e.time_out), 0);
        }
      }
    } catch {
      // Fallback to reference values
    }
  }

  const currentUser = user ?? { email: "maria.santos@wvsu.edu.ph" };

  return (
    <AppShell
      role="student"
      active="hours"
      title="Attendance"
      description="Track your daily work hours, presence verification, and remaining completion days."
      user={currentUser}
    >
      <AttendanceClient
        companyName={companyName}
        initialApprovedHours={approvedHours}
        requiredHours={requiredHours}
      />
    </AppShell>
  );
}
