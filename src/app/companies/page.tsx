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
import { getCurrentUser } from "@/lib/auth";
import { describeMoa, moaStatus, needsAttention } from "@/lib/moa";
import { todayInManila } from "@/lib/time";
import { CompanyForm } from "./company-form";
import { MoaForm } from "./moa-form";
import { SupervisorsPanel } from "./supervisors-panel";
import { AppShell } from "@/components/app-shell/app-shell";

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
    <AppShell
      role="coordinator"
      active="companies"
      title="Companies"
      description="Partner companies, their MOA dates, and who can approve hours for each."
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Add a partner company</CardTitle>
          <CardDescription>
            A company you already have a signed MOA with. It becomes an
            offline partner: an accepted partnership with no company account.
            Nobody else checks it, so type it carefully. Companies that join
            Dugtong appear here too once they accept a partnership on the{" "}
            <Link href="/partnerships" className="underline underline-offset-4">
              Partnerships page
            </Link>
            . The MOA dates are optional, and you can add them later.
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
            <div className="rounded-[var(--radius)] border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>MOA</TableHead>
                    <TableHead>Supervisor logins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => {
                    const status = moaStatus(c.moa_expires_on, today);
                    return (
                      <TableRow key={c.id} className="align-top">
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.supervisor_name}</TableCell>
                        <TableCell>
                          <p
                            className={
                              needsAttention(status)
                                ? "font-medium text-destructive-text"
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
