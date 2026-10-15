import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { setSchoolVerified } from "./actions";
import {
  EmployersCard,
  type DocumentRow,
  type EmployerRow,
} from "./employers-card";
import {
  ReportsCard,
  type EscalatedReportRow,
  type FlaggedCompanyRow,
  type AppealRow,
} from "./reports-card";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

type SchoolRow = {
  id: string;
  name: string;
  created_at: string;
  verified: boolean;
  coordinator_email: string | null;
  student_count: number;
  company_count: number;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  // Only members of the Dugtong team (the `admins` table) get past here.
  // Everyone else sees an ordinary "not found" page, so the screen's
  // existence is not advertised.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const { data } = await supabase.rpc("admin_list_schools");
  const schools = (data ?? []) as SchoolRow[];
  const waiting = schools.filter((s) => !s.verified).length;

  const { data: employerData } = await supabase.rpc("admin_list_employers");
  const employers = (employerData ?? []) as EmployerRow[];
  const { data: documentData } = await supabase
    .from("employer_documents")
    .select("id, employer_id, kind, file_name, created_at")
    .order("created_at", { ascending: false });
  const documents = (documentData ?? []) as DocumentRow[];
  const companiesWaiting = employers.filter((e) => e.status === "pending").length;

  // Misuse reports a coordinator escalated, and companies flagged for
  // repeated upheld reports. Neither includes any student.
  const { data: escalatedData } = await supabase.rpc("admin_escalated_reports");
  const escalated = (escalatedData ?? []) as EscalatedReportRow[];
  const { data: flaggedData } = await supabase.rpc("admin_flagged_companies");
  const flagged = (flaggedData ?? []) as FlaggedCompanyRow[];
  const { data: appealData } = await supabase.rpc("admin_pending_appeals");
  const appeals = (appealData ?? []) as AppealRow[];
  const reportsWaiting =
    escalated.length +
    appeals.length +
    flagged.filter((c) => c.review_state === "flagged").length;

  return (
    <AppShell
      role="admin"
      active="admin"
      title="Admin"
      description={`${waiting === 0 ? "No schools waiting." : `${waiting} ${waiting === 1 ? "school is" : "schools are"} waiting for verification.`} ${companiesWaiting === 0 ? "No companies waiting." : `${companiesWaiting} ${companiesWaiting === 1 ? "company is" : "companies are"} waiting for review.`}`}
      user={user}
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      <Tabs
        defaultValue={
          waiting > 0
            ? "schools"
            : companiesWaiting > 0
              ? "companies"
              : reportsWaiting > 0
                ? "reports"
                : "schools"
        }
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="schools">
            Schools{waiting > 0 ? ` (${waiting} waiting)` : ""}
          </TabsTrigger>
          <TabsTrigger value="companies">
            Companies{companiesWaiting > 0 ? ` (${companiesWaiting} waiting)` : ""}
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports{reportsWaiting > 0 ? ` (${reportsWaiting} waiting)` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="schools">
          <Card>
            <CardHeader>
              <CardTitle>Schools</CardTitle>
              <CardDescription>
                Students can only sign in once their school is verified. Only
                verify a school you know is real. Waiting schools are listed
                first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No schools yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">School</th>
                        <th className="px-3 py-2 font-medium">Coordinator</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2 text-right font-medium">Students</th>
                        <th className="px-3 py-2 text-right font-medium">Companies</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2">{s.coordinator_email ?? "—"}</td>
                          <td className="px-3 py-2 tabular-nums">
                            {s.created_at.slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {s.student_count}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {s.company_count}
                          </td>
                          <td className="px-3 py-2">
                            {s.verified ? "Verified" : "Waiting"}
                          </td>
                          <td className="px-3 py-2">
                            <form action={setSchoolVerified}>
                              <input type="hidden" name="school_id" value={s.id} />
                              <input
                                type="hidden"
                                name="verify"
                                value={s.verified ? "false" : "true"}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant={s.verified ? "outline" : "default"}
                              >
                                {s.verified ? "Remove verification" : "Verify"}
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
        </TabsContent>
        <TabsContent value="companies">
          <EmployersCard employers={employers} documents={documents} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsCard escalated={escalated} flagged={flagged} appeals={appeals} />
        </TabsContent>
      </Tabs>

    </AppShell>
  );
}
