import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../login/actions";
import { setSchoolVerified } from "./actions";

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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dugtong admin
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.email} ·{" "}
            {waiting === 0
              ? "No schools waiting."
              : `${waiting} ${waiting === 1 ? "school is" : "schools are"} waiting for verification.`}
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
    </main>
  );
}
