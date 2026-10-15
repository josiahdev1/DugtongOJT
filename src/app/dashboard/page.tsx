import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { getCurrentUser } from "@/lib/auth";
import { formatHours } from "@/lib/time";
import { signOut } from "../login/actions";
import { RoleShell } from "@/components/role-shell";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/"); // not a coordinator

  const { imported } = await searchParams;

  const [{ data: students }, { data: companies }, { data: totals }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, name, student_no, course, company_id, required_hours")
        .order("name"),
      supabase.from("companies").select("id, name"),
      // Approved hours and pending counts, added up by the database.
      supabase
        .from("student_hours")
        .select("student_id, approved_hours, pending_count"),
    ]);
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const hoursOf = new Map(
    (totals ?? []).map((t) => [
      t.student_id,
      { approved: Number(t.approved_hours), pending: Number(t.pending_count) },
    ]),
  );
  const totalPending = (totals ?? []).reduce(
    (sum, t) => sum + Number(t.pending_count),
    0,
  );
  const totalApproved = (totals ?? []).reduce(
    (sum, t) => sum + Number(t.approved_hours),
    0,
  );

  return (
    <RoleShell active="dashboard" role="Coordinator" title={school.name} subtitle={user.email ?? ""} action={<><Link href="/companies" className={buttonVariants({ variant: "outline", size: "sm" })}>Add company</Link><Link href="/roster/upload" className={buttonVariants({ size: "sm" })}>Upload roster</Link></>}>
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
      {/* Top bar / Shell header */}
      <header className="sr-only">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              {school.name}
            </h1>
            <Badge variant="verified">School</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Coordinator · {user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/companies" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Add company
          </Link>
          <Link href="/roster/upload" className={buttonVariants({ size: "sm" })}>
            Upload roster
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Rostered students</CardDescription>
            <CardTitle className="text-2xl font-medium text-primary tabular-nums">
              {students?.length ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-xs text-muted-foreground">
              {companies?.length ?? 0} partner {companies?.length === 1 ? "company" : "companies"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Pending approvals</CardDescription>
            <CardTitle className="text-2xl font-medium text-warning-text tabular-nums">
              {totalPending}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-xs text-muted-foreground">
              {totalPending === 0 ? "All caught up" : "Requires coordinator action"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Total approved hours</CardDescription>
            <CardTitle className="text-2xl font-medium text-success-text tabular-nums">
              {formatHours(totalApproved)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-xs text-muted-foreground">Across all enrolled students</span>
          </CardContent>
        </Card>
      </div>

      {imported && Number(imported) > 0 && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-[8px] border border-success/30 bg-success-bg p-3 text-xs font-medium text-success-text"
        >
          ✓ Imported {Number(imported)}{" "}
          {Number(imported) === 1 ? "student" : "students"} successfully.
        </div>
      )}

      {/* Main Students Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                {students && students.length > 0
                  ? `${students.length} students on your roster`
                  : "No students yet."}
              </CardDescription>
            </div>
            {totalPending > 0 && (
              <Badge variant="pending">
                {totalPending} {totalPending === 1 ? "entry" : "entries"} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!students || students.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Add a partner company, then upload a roster. Your students will
              appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Approved / required</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const studentApproved = hoursOf.get(s.id)?.approved ?? 0;
                  const studentPending = hoursOf.get(s.id)?.pending ?? 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">
                        <Link
                          href={`/students/${s.id}`}
                          className="hover:text-primary hover:underline underline-offset-4"
                        >
                          {s.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.student_no}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.course}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {companyName.get(s.company_id) ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-mono text-xs">
                        <span className="font-medium text-foreground">
                          {formatHours(studentApproved)}
                        </span>{" "}
                        / {s.required_hours} hrs
                      </TableCell>
                      <TableCell className="text-right">
                        {studentPending > 0 ? (
                          <Badge variant="pending">{studentPending}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/students/${s.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
    </RoleShell>
  );
}
