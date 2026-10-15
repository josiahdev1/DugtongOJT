import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, KpiCard, Pill } from "@/components/ui";
import { findEmployer, getCurrentUser } from "@/lib/auth";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABEL,
  EMPLOYER_STATUS_LABEL,
} from "@/lib/employers";
import { LISTING_STATUS_LABEL } from "@/lib/listings";
import type { EmployerLinkRequest, EmployerPartnership } from "@/lib/partnerships";
import { DocumentUploader } from "./document-uploader";
import { ListingForm } from "./listing-form";
import type { EmployerApplication } from "@/lib/applications";
import { ApplicationsCard } from "./applications-card";
import { PartnershipsCard } from "./partnerships-card";
import { setListingStatus } from "./listing-actions";
import { AppShell } from "@/components/app-shell/app-shell";
import { ShieldCheck, Plus, ExternalLink, FileText, UserCheck } from "lucide-react";

export const metadata = { title: "Company Dashboard — Dugtong OJT" };
export const dynamic = "force-dynamic";

const STATUS_NOTE: Record<string, string> = {
  pending:
    "The Dugtong team will check your documents. You cannot publish anything until your company is verified.",
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

  const verified = employer.status === "verified";

  // Row Level Security returns only this company's own rows. Partnership
  // data comes from database functions, because those tables cannot be read
  // directly.
  const [
    { data: listingData },
    { data: courseRows },
    { data: partnershipData },
    { data: schoolData },
    { data: linkData },
    { data: applicationData },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, course, role_title, slots, required_hours, city, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("name").order("name"),
    supabase.rpc("employer_partnerships"),
    supabase.rpc("verified_schools"),
    supabase.rpc("employer_link_requests"),
    supabase.rpc("employer_applications"),
    supabase
      .from("employer_documents")
      .select("id, kind, file_name, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const listings = listingData ?? [];
  const courses = (courseRows ?? []).map((c) => c.name);
  const partnerships = (partnershipData ?? []) as EmployerPartnership[];
  const schools = (schoolData ?? []) as { id: string; name: string }[];
  const linkRequests = (linkData ?? []) as EmployerLinkRequest[];
  const applications = (applicationData ?? []) as EmployerApplication[];

  const applicationsWaiting = applications.filter((a) => a.status === "sent").length;
  const requestsWaiting =
    partnerships.filter(
      (p) => p.status === "requested" && p.requested_by === "school",
    ).length + linkRequests.filter((l) => l.status === "requested").length;
  const acceptedPartners = partnerships.filter((p) => p.status === "accepted");

  const latest = (kind: string) => (documents ?? []).find((d) => d.kind === kind);
  const missing = DOCUMENT_KINDS.filter((k) => !latest(k));

  const published = listings.filter((l) => l.status === "published");
  const openSlots = published.reduce((sum, l) => sum + (l.slots ?? 0), 0);

  return (
    <AppShell
      role="company"
      active="company"
      title={employer.name}
      description="Company openings, candidate applications, school partnerships and credential verification."
      user={user}
      org={{
        name: employer.name,
        verified: verified ? true : employer.status === "pending" ? false : undefined,
      }}
      counts={{
        openings: listings.length,
        applications: applicationsWaiting,
        partnerships: requestsWaiting,
      }}
      wide
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/listings"
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="size-3.5 mr-1.5" />
            Public view
          </Link>
          <a
            href="#post-opening"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-3.5 mr-1" />
            New opening
          </a>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          ✓ {message}
        </div>
      )}

      {/* 2-Column Main Layout: Left side content (minmax(0,1fr)), Right aside (320px) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Left Main Column */}
        <div className="flex flex-col gap-6 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Active openings"
              value={published.length}
              subtext={`${openSlots} slots across published openings`}
            />
            <KpiCard
              label="Applications waiting"
              value={applicationsWaiting}
              subtext={`${applications.length} received in total`}
            />
            <KpiCard
              label="Partner schools"
              value={acceptedPartners.length}
              subtext="accepted partnerships"
            />
            <KpiCard
              label="School requests"
              value={requestsWaiting}
              subtext="waiting for your answer"
            />
          </div>

          {/* Openings Card */}
          <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden" id="openings">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-medium leading-5 text-foreground">
                  Your OJT openings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {verified
                    ? "Published openings are visible to students on the public openings page."
                    : "You can save drafts now. You can publish once the Dugtong team verifies your company."}
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {listings.length} listed
              </span>
            </div>

            {listings.length === 0 ? (
              <EmptyState
                title="You have not posted anything yet"
                description="Use the form below to save a draft or publish your first OJT opening."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface text-[12px] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-3 py-2 font-medium">Opening role</th>
                      <th className="px-3 py-2 font-medium">Course</th>
                      <th className="px-3 py-2 font-medium">Location</th>
                      <th className="px-3 py-2 text-right font-medium">Slots</th>
                      <th className="px-3 py-2 text-right font-medium">Hours</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                          {l.role_title ?? l.course}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {l.course}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {l.city}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground whitespace-nowrap">
                          {l.slots}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-foreground whitespace-nowrap">
                          {l.required_hours} hrs
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Pill variant={l.status === "published" ? "verified" : "pending"}>
                            {LISTING_STATUS_LABEL[l.status] ?? l.status}
                          </Pill>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/company/listings/${l.id}/edit`}
                              className={buttonVariants({ size: "sm", variant: "outline" })}
                            >
                              Edit
                            </Link>
                            <form action={setListingStatus} className="inline">
                              <input type="hidden" name="listing_id" value={l.id} />
                              {l.status === "published" ? (
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="ghost"
                                  name="status"
                                  value="closed"
                                >
                                  Close
                                </Button>
                              ) : (
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="ghost"
                                  name="status"
                                  value="published"
                                  disabled={!verified}
                                >
                                  {l.status === "closed" ? "Reopen" : "Publish"}
                                </Button>
                              )}
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operational Subgrid (2-column): Applications & Post Opening Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div id="applications" className="min-w-0">
              <ApplicationsCard applications={applications} />
            </div>

            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm" id="post-opening">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-1">
                Post new opening
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Students agree to the scope of tasks you write, so be specific.
              </p>
              <ListingForm courses={courses} />
            </div>
          </div>

          <div id="partnerships" className="min-w-0">
            <PartnershipsCard
              partnerships={partnerships}
              linkRequests={linkRequests}
              schools={schools}
              verified={verified}
            />
          </div>
        </div>

        {/* Right Aside: 320px */}
        <aside className="flex flex-col gap-6">
          {/* Company Verification & Documents Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <h3 className="text-[15px] font-medium leading-5 text-foreground">
                  Verification
                </h3>
              </div>
              <Pill
                variant={
                  employer.status === "verified"
                    ? "verified"
                    : employer.status === "rejected"
                      ? "rejected"
                      : "pending"
                }
              >
                {EMPLOYER_STATUS_LABEL[employer.status] ?? employer.status}
              </Pill>
            </div>

            <p className="mb-3 text-xs text-muted-foreground">
              {STATUS_NOTE[employer.status]}
              {employer.status === "pending" && missing.length > 0
                ? ` Still to upload: ${missing.map((k) => DOCUMENT_LABEL[k]).join(" and ")}.`
                : ""}
            </p>

            <div className="divide-y divide-border text-[13px]">
              {DOCUMENT_KINDS.map((kind) => {
                const doc = latest(kind);
                return (
                  <div
                    key={kind}
                    className="py-2 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                      {doc ? (
                        <Link
                          href={`/documents/${doc.id}`}
                          target="_blank"
                          className="truncate font-medium text-foreground underline underline-offset-4"
                          title={doc.file_name}
                        >
                          {DOCUMENT_LABEL[kind] ?? kind}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">
                          {DOCUMENT_LABEL[kind] ?? kind}
                        </span>
                      )}
                    </div>
                    <Pill variant={doc ? "verified" : "pending"}>
                      {doc ? `Uploaded ${doc.created_at.slice(0, 10)}` : "Not uploaded"}
                    </Pill>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                PDF, JPEG or PNG, up to 5 MB each. Stored privately; only your
                company and the Dugtong team can open them.
              </p>
              {DOCUMENT_KINDS.map((kind) => (
                <DocumentUploader
                  key={kind}
                  employerId={employer.id}
                  kind={kind}
                  label={
                    latest(kind)
                      ? `Replace ${DOCUMENT_LABEL[kind] ?? kind}`
                      : `Upload ${DOCUMENT_LABEL[kind] ?? kind}`
                  }
                />
              ))}
            </div>
          </div>

          {/* Authorized Representative Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="size-4 text-primary" />
              <h3 className="text-[15px] font-medium leading-5 text-foreground">
                Representative
              </h3>
            </div>
            <div className="text-[13px]">
              <div className="font-medium text-foreground">
                {employer.representative_name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {employer.representative_position}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-1">
                {user.email}
              </div>
            </div>
          </div>

          {/* School Partnerships summary */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-medium leading-5 text-foreground">
                Partner schools
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {acceptedPartners.length} accepted
              </span>
            </div>

            {acceptedPartners.length === 0 ? (
              <EmptyState
                className="p-4"
                title="No partner schools yet"
                description="Accepted school partnerships appear here. Manage requests in the partnerships section."
              />
            ) : (
              <div className="divide-y divide-border text-[13px]">
                {acceptedPartners.map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium text-foreground">{p.school_name}</div>
                      {p.decided_at && (
                        <div className="text-xs text-muted-foreground">
                          Since {p.decided_at.slice(0, 10)}
                        </div>
                      )}
                    </div>
                    <Pill variant="approved">Accepted</Pill>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
