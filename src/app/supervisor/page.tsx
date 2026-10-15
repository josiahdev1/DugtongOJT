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
import { formatHours, hoursBetween, shortTime } from "@/lib/time";
import { signOut } from "../login/actions";
import { decideAsSupervisor } from "./actions";

export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  name: string;
  student_no: string;
  course: string;
  required_hours: number;
  company_id: string;
  approved_hours: number;
  pending_count: number;
};

export default async function SupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: isSupervisor } = await supabase.rpc("is_supervisor");
  if (!isSupervisor) redirect("/");

  // Name, ID, course and hours of THIS supervisor's students only, without
  // emails. The database function decides who is "theirs".
  const { data: studentData } = await supabase.rpc("supervisor_students");
  const students = (studentData ?? []) as StudentRow[];
  const nameOf = new Map(students.map((s) => [s.id, s.name]));

  const [{ data: companies }, { data: pending }] = await Promise.all([
    supabase.from("companies").select("id, name"),
    supabase
      .from("time_entries")
      .select("id, student_id, work_date, time_in, time_out")
      .eq("status", "pending")
      .order("work_date", { ascending: true }),
  ]);
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Supervisor
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.email} ·{" "}
            {(companies ?? []).map((c) => c.name).join(", ") || "No company"}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waiting for your approval</CardTitle>
          <CardDescription>
            Approve the hours your students really worked. The school
            coordinator can still change a decision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pending || pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is waiting.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Student</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        {nameOf.get(e.student_id) ?? "—"}
                      </td>
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
                        <form action={decideAsSupervisor} className="flex gap-2">
                          <input type="hidden" name="entry_id" value={e.id} />
                          <Button
                            type="submit"
                            size="sm"
                            name="decision"
                            value="approved"
                          >
                            Approve
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            name="decision"
                            value="rejected"
                          >
                            Reject
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your students</CardTitle>
          <CardDescription>
            {students.length === 0
              ? "No students are placed at your company yet."
              : `${students.length} placed at your company.`}
          </CardDescription>
        </CardHeader>
        {students.length > 0 && (
          <CardContent>
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Student ID</th>
                    <th className="px-3 py-2 font-medium">Course</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Approved / required
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {s.student_no}
                      </td>
                      <td className="px-3 py-2">{s.course}</td>
                      <td className="px-3 py-2">
                        {companyName.get(s.company_id) ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatHours(Number(s.approved_hours))} /{" "}
                        {s.required_hours}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Number(s.pending_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </main>
  );
}
