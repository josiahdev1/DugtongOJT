import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findEmployer, getCurrentUser } from "@/lib/auth";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABEL,
  EMPLOYER_STATUS_LABEL,
} from "@/lib/employers";
import { LISTING_STATUS_LABEL } from "@/lib/listings";
import type { EmployerPartnership } from "@/lib/partnerships";
import { signOut } from "../login/actions";
import { DocumentUploader } from "./document-uploader";
import { ListingForm } from "./listing-form";
import { PartnershipsCard } from "./partnerships-card";
import { setListingStatus } from "./listing-actions";

export const dynamic = "force-dynamic";

const STATUS_NOTE: Record<string, string> = {
  pending:
    "The Dugtong team will check your documents. You cannot post anything until your company is verified.",
  verified: "Your company is verified.",
  rejected:
    "Your company was not verified. Check that your documents are clear and correct, upload them again, and contact the Dugtong team.",
};

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const employer = await findEmployer(supabase);
  if (!employer) redirect("/company/setup");

  // Row Level Security returns only this company's own listings.
  const [{ data: listings }, { data: courseRows }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, course, role_title, slots, required_hours, city, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("name").order("name"),
  ]);
  const courses = (courseRows ?? []).map((c) => c.name);
  const verified = employer.status === "verified";

  // Partnerships come from database functions, because the partnerships
  // table itself cannot be read directly.
  const [{ data: partnershipData }, { data: schoolData }] = await Promise.all([
    supabase.rpc("employer_partnerships"),
    supabase.rpc("verified_schools"),
  ]);
  const partnerships = (partnershipData ?? []) as EmployerPartnership[];
  const schools = (schoolData ?? []) as { id: string; name: string }[];

  // Row Level Security returns only this company's own documents.
  const { data: documents } = await supabase
    .from("employer_documents")
    .select("id, kind, file_name, created_at")
    .order("created_at", { ascending: false });

  const latest = (kind: string) =>
    (documents ?? []).find((d) => d.kind === kind);
  const missing = DOCUMENT_KINDS.filter((k) => !latest(k));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {employer.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Company account · {user.email}
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
      {message && (
        <p role="status" className="text-sm font-medium">
          ✓ {message}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Status: {EMPLOYER_STATUS_LABEL[employer.status] ?? employer.status}
          </CardTitle>
          <CardDescription>
            {STATUS_NOTE[employer.status]}
            {employer.status === "pending" && missing.length > 0
              ? ` Still to upload: ${missing.map((k) => DOCUMENT_LABEL[k]).join(" and ")}.`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          Authorized representative:{" "}
          <span className="font-medium">{employer.representative_name}</span>,{" "}
          {employer.representative_position}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification documents</CardTitle>
          <CardDescription>
            PDF, JPEG or PNG, up to 5 MB each. They are stored privately.
            Only your company and the Dugtong team can open them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {DOCUMENT_KINDS.map((kind) => {
            const doc = latest(kind);
            return (
              <div key={kind} className="flex flex-col gap-3">
                <DocumentUploader
                  employerId={employer.id}
                  kind={kind}
                  label={DOCUMENT_LABEL[kind]}
                />
                <p className="text-sm text-muted-foreground">
                  {doc ? (
                    <>
                      Latest:{" "}
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-medium text-foreground underline underline-offset-4"
                        target="_blank"
                      >
                        {doc.file_name}
                      </Link>{" "}
                      ({doc.created_at.slice(0, 10)})
                    </>
                  ) : (
                    "Nothing uploaded yet."
                  )}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <PartnershipsCard
        partnerships={partnerships}
        schools={schools}
        verified={verified}
      />

      <Card>
        <CardHeader>
          <CardTitle>Post an OJT opening</CardTitle>
          <CardDescription>
            {verified
              ? "Published openings appear on the public OJT openings page. Students agree to the scope of tasks you write, so be specific."
              : "You can save drafts now. You can publish once the Dugtong team verifies your company."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm courses={courses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your openings</CardTitle>
          <CardDescription>
            <Link
              href="/listings"
              className="underline underline-offset-4"
              target="_blank"
            >
              See the public page
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!listings || listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have not posted anything yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Opening</th>
                    <th className="px-3 py-2 font-medium">City</th>
                    <th className="px-3 py-2 text-right font-medium">Slots</th>
                    <th className="px-3 py-2 text-right font-medium">Hours</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        {l.role_title ?? l.course}
                        {l.role_title && (
                          <span className="block text-xs text-muted-foreground">
                            {l.course}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">{l.city}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{l.slots}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {l.required_hours}
                      </td>
                      <td className="px-3 py-2">
                        {LISTING_STATUS_LABEL[l.status] ?? l.status}
                      </td>
                      <td className="px-3 py-2">
                        <form action={setListingStatus}>
                          <input type="hidden" name="listing_id" value={l.id} />
                          {l.status === "published" ? (
                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                              name="status"
                              value="closed"
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              size="sm"
                              name="status"
                              value="published"
                              disabled={!verified}
                            >
                              {l.status === "closed" ? "Reopen" : "Publish"}
                            </Button>
                          )}
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
