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
import {
  PARTNERSHIP_STATUS_LABEL,
  type SchoolPartnership,
} from "@/lib/partnerships";
import { answerPartnership } from "./actions";

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
  const offline = all.filter((p) => p.kind === "offline");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/dashboard"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← Dashboard
      </Link>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
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
            They do not have a Dugtong account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offline.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {offline.map((p) => (
                <li key={p.id}>{p.company_name}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
