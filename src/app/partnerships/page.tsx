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
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  LINK_STATUS_LABEL,
  PARTNERSHIP_STATUS_LABEL,
  type SchoolLink,
  type SchoolPartnership,
} from "@/lib/partnerships";
import { answerPartnership, proposeLink } from "./actions";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

export default async function PartnershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  const { user, school, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!school) redirect("/");

  // The partnerships table cannot be read directly; this database function
  // returns only this school's own.
  const { data } = await supabase.rpc("school_partnerships");
  const all = (data ?? []) as SchoolPartnership[];

  const incoming = all.filter(
    (p) => p.kind === "platform" && p.status === "requested" && p.requested_by === "employer",
  );
  const sent = all.filter(
    (p) => p.kind === "platform" && p.status === "requested" && p.requested_by === "school",
  );
  const accepted = all.filter((p) => p.kind === "platform" && p.status === "accepted");
  const declined = all.filter((p) => p.kind === "platform" && p.status === "declined");

  // Linking an offline partner to the same company on the platform.
  const [{ data: linkData }, { data: linkableData }, { data: offlineCompanies }] =
    await Promise.all([
      supabase.rpc("school_links"),
      supabase.rpc("linkable_employers"),
      supabase.from("companies").select("id, name").is("employer_id", null).order("name"),
    ]);
  const links = (linkData ?? []) as SchoolLink[];
  const linkable = (linkableData ?? []) as { id: string; name: string }[];
  // The latest link request for each offline partner.
  const linkOf = new Map<string, SchoolLink>();
  for (const l of [...links].reverse()) linkOf.set(l.company_id, l);

  return (
    <AppShell
      role="coordinator"
      active="partnerships"
      title="Partnerships"
      description="Companies you partner with, and requests waiting for your answer."
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}
      {message && (
        <p role="status" className="text-sm font-medium">
          ✓ {message}
        </p>
      )}

      {!school.verified && (
        <p
          role="status"
          className="rounded-[var(--radius)] border border-border bg-secondary p-3 text-sm"
        >
          <span className="font-medium">Waiting for verification.</span> You
          can send and receive partnership requests once the Dugtong team
          verifies your school.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requests from companies</CardTitle>
          <CardDescription>
            A company asked to partner with your school. Only you can answer.
            If you accept, the company appears in your companies, and you can
            assign students to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No requests are waiting.
            </p>
          ) : (
            incoming.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3"
              >
                <p className="text-sm">
                  <span className="font-medium">{p.company_name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · asked {p.created_at.slice(0, 10)}
                  </span>
                </p>
                <form action={answerPartnership} className="flex gap-2">
                  <input type="hidden" name="partnership_id" value={p.id} />
                  <Button type="submit" size="sm" name="accept" value="true">
                    Accept
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    name="accept"
                    value="false"
                  >
                    Decline
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Find a company</CardTitle>
          <CardDescription>
            Browse the openings posted by verified companies and ask one to
            partner with your school.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Link href="/listings" className={buttonVariants({ variant: "outline" })}>
              Browse OJT openings
            </Link>
          </div>
          {sent.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Waiting for a company to answer</p>
              <ul className="text-sm text-muted-foreground">
                {sent.map((p) => (
                  <li key={p.id}>
                    {p.company_name} · asked {p.created_at.slice(0, 10)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform partners</CardTitle>
          <CardDescription>
            Verified companies that agreed to partner with your school through
            Dugtong.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {accepted.length === 0 && declined.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {accepted.map((p) => (
                <li key={p.id}>
                  {p.company_name} ·{" "}
                  {PARTNERSHIP_STATUS_LABEL[p.status]}{" "}
                  {p.decided_at?.slice(0, 10)}
                </li>
              ))}
              {declined.map((p) => (
                <li key={p.id} className="text-muted-foreground">
                  {p.company_name} ·{" "}
                  {PARTNERSHIP_STATUS_LABEL[p.status]}{" "}
                  {p.decided_at?.slice(0, 10)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline partners</CardTitle>
          <CardDescription>
            Companies you added yourself on the Companies page. They count as
            accepted partnerships, based on a signed MOA you already hold.
            They do not have a Dugtong account. When one of them joins
            Dugtong, you can link it to its account: the company must accept,
            and its students, hours and reports stay exactly as they are.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(offlineCompanies ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            (offlineCompanies ?? []).map((c) => {
              const link = linkOf.get(c.id);
              const canAsk = !link || link.status === "declined";
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-[8px] border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    {link && (
                      <Badge
                        variant={
                          link.status === "accepted"
                            ? "approved"
                            : link.status === "declined"
                              ? "secondary"
                              : "pending"
                        }
                      >
                        {LINK_STATUS_LABEL[link.status]}
                      </Badge>
                    )}
                  </div>
                  {link && (
                    <p className="text-xs text-muted-foreground">
                      Link to {link.employer_name} · asked{" "}
                      <span className="font-mono tabular-nums">
                        {link.created_at.slice(0, 10)}
                      </span>
                    </p>
                  )}
                  {canAsk && school.verified && (
                    <details>
                      <summary className="w-fit cursor-pointer list-none rounded-[8px] border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {link ? "Ask another company" : "Link to a Dugtong company"}
                      </summary>
                      <form action={proposeLink} className="mt-3 flex flex-col gap-2">
                        <input type="hidden" name="company_id" value={c.id} />
                        <label
                          htmlFor={`link-${c.id}`}
                          className="text-sm font-medium"
                        >
                          Which Dugtong company is {c.name}?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            id={`link-${c.id}`}
                            name="employer_id"
                            required
                            defaultValue=""
                            className="max-w-sm"
                          >
                            <option value="" disabled>
                              {linkable.length === 0
                                ? "No verified companies to link to"
                                : "Choose a company…"}
                            </option>
                            {linkable.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </Select>
                          <Button type="submit" disabled={linkable.length === 0}>
                            Send link request
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Only verified companies you have no partnership with
                          yet are listed. Nothing changes until the company
                          accepts.
                        </p>
                      </form>
                    </details>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
