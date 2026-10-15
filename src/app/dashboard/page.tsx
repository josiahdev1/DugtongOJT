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
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../login/actions";

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

  const [{ data: students }, { data: companies }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, student_no, course, company_id, required_hours")
      .order("name"),
    supabase.from("companies").select("id, name"),
  ]);
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {school.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Coordinator · {user.email}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link href="/companies" className={buttonVariants({ variant: "outline" })}>
          Add company
        </Link>
        <Link href="/roster/upload" className={buttonVariants()}>
          Upload roster
        </Link>
      </div>

      {imported && Number(imported) > 0 && (
        <p role="status" className="text-sm font-medium">
          ✓ Imported {Number(imported)}{" "}
          {Number(imported) === 1 ? "student" : "students"}.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            {students && students.length > 0
              ? `${students.length} on your roster.`
              : "No students yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a partner company, then upload a roster. Your students will
              appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Student ID</th>
                    <th className="px-3 py-2 font-medium">Course</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Required hours
                    </th>
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
                        {s.required_hours}
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
