import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { describeMoa, moaStatus, needsAttention } from "@/lib/moa";
import { todayInManila } from "@/lib/time";
import { CompanyForm } from "./company-form";
import { MoaForm } from "./moa-form";
import { SupervisorsPanel } from "./supervisors-panel";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, supervisor_name, moa_signed_on, moa_expires_on")
    .order("name");

  const { data: supervisors } = await supabase
    .from("company_supervisors")
    .select("id, company_id, email")
    .order("email");
  const supervisorsOf = (companyId: string) =>
    (supervisors ?? []).filter((s) => s.company_id === companyId);

  const today = todayInManila();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/dashboard"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add a partner company</CardTitle>
          <CardDescription>
            A company you already have a signed MOA with. Nobody else checks
            it, so type it carefully. The MOA dates are optional, and you can
            add them later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your companies</CardTitle>
        </CardHeader>
        <CardContent>
          {!companies || companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No companies yet. Add your first one above.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">Supervisor</th>
                    <th className="px-3 py-2 font-medium">MOA</th>
                    <th className="px-3 py-2 font-medium">Supervisor logins</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => {
                    const status = moaStatus(c.moa_expires_on, today);
                    return (
                      <tr key={c.id} className="border-t border-border align-top">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2">{c.supervisor_name}</td>
                        <td className="px-3 py-2">
                          <p
                            className={
                              needsAttention(status)
                                ? "font-medium text-destructive"
                                : undefined
                            }
                          >
                            {needsAttention(status) ? "⚠ " : ""}
                            {describeMoa(status)}
                          </p>
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer underline underline-offset-4">
                              Change MOA dates
                            </summary>
                            <MoaForm
                              companyId={c.id}
                              signedOn={c.moa_signed_on}
                              expiresOn={c.moa_expires_on}
                            />
                          </details>
                        </td>
                        <td className="px-3 py-2">
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer underline underline-offset-4">
                              {supervisorsOf(c.id).length === 0
                                ? "Add a supervisor"
                                : `${supervisorsOf(c.id).length} supervisor${supervisorsOf(c.id).length === 1 ? "" : "s"}`}
                            </summary>
                            <SupervisorsPanel
                              companyId={c.id}
                              supervisors={supervisorsOf(c.id)}
                            />
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
