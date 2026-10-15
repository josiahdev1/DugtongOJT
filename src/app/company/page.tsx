import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { KpiCard, Pill } from "@/components/ui";
import { findEmployer, getCurrentUser } from "@/lib/auth";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABEL,
  EMPLOYER_STATUS_LABEL,
} from "@/lib/employers";
import type { EmployerLinkRequest, EmployerPartnership } from "@/lib/partnerships";
import { DocumentUploader } from "./document-uploader";
import { ListingForm } from "./listing-form";
import type { EmployerApplication } from "@/lib/applications";
import { ApplicationsCard } from "./applications-card";
import { setListingStatus } from "./listing-actions";
import { AppShell } from "@/components/app-shell/app-shell";
import { ShieldCheck, Plus, ExternalLink, FileText, UserCheck } from "lucide-react";

export const metadata = { title: "Company Dashboard — Dugtong OJT" };
export const dynamic = "force-dynamic";

const SEED_LISTINGS = [
  {
    id: "l-1",
    role_title: "Web Development Intern",
    course: "BSIT / BSCS",
    city: "Iloilo City",
    slots: 3,
    required_hours: 486,
    status: "published",
  },
  {
    id: "l-2",
    role_title: "Quality Assurance & Testing Intern",
    course: "BSIT / BSIS",
    city: "Mandurriao, Iloilo",
    slots: 4,
    required_hours: 400,
    status: "published",
  },
  {
    id: "l-3",
    role_title: "Frontend UI/UX Intern",
    course: "BSIT",
    city: "Iloilo City",
    slots: 2,
    required_hours: 240,
    status: "published",
  },
];

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { user, supabase } = await getCurrentUser();

  let realEmployer = null;
  if (supabase && user) {
    try {
      realEmployer = await findEmployer(supabase);
    } catch {
      // Fallback
    }
  }

  const employer = realEmployer ?? {
    id: "demo-employer",
    name: "Iloilo IT Solutions Inc.",
    status: "verified",
    representative_name: "Eduardo Morales",
    representative_position: "Head of People & Engineering",
  };

  const currentUser = user ?? { email: "supervisor@iloilotech.ph" };
  const verified = employer.status === "verified";

  type ListingRow = {
    id: string;
    course: string;
    role_title: string;
    slots: number;
    required_hours: number;
    city: string;
    status: string;
    created_at?: string;
  };

  type EmployerDoc = {
    id: string;
    kind: string;
    file_name: string;
    created_at: string;
  };

  // Data queries
  let listings: ListingRow[] = SEED_LISTINGS;
  let applications: EmployerApplication[] = [];
  let partnerships: EmployerPartnership[] = [];
  let linkRequests: EmployerLinkRequest[] = [];
  let documents: EmployerDoc[] = [];
  let courses: string[] = ["BSIT", "BSCS", "BSIS", "BSBA"];

  if (supabase && user && realEmployer) {
    try {
      const [
        { data: lData },
        { data: cData },
        { data: pData },
        { data: lrData },
        { data: aData },
        { data: dData },
      ] = await Promise.all([
        supabase
          .from("listings")
          .select("id, course, role_title, slots, required_hours, city, status, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("courses").select("name").order("name"),
        supabase.rpc("employer_partnerships"),
        supabase.rpc("employer_link_requests"),
        supabase.rpc("employer_applications"),
        supabase
          .from("employer_documents")
          .select("id, kind, file_name, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (lData && lData.length > 0) listings = lData as ListingRow[];
      if (cData) courses = (cData as { name: string }[]).map((c) => c.name);
      if (pData) partnerships = pData as EmployerPartnership[];
      if (lrData) linkRequests = lrData as EmployerLinkRequest[];
      if (aData) applications = aData as EmployerApplication[];
      if (dData) documents = dData as EmployerDoc[];
    } catch {
      // Fallback
    }
  }

  const applicationsWaiting = applications.filter((a) => a.status === "sent").length;
  const requestsWaiting =
    partnerships.filter(
      (p) => p.status === "requested" && p.requested_by === "school",
    ).length + linkRequests.filter((l) => l.status === "requested").length;

  const latest = (kind: string) =>
    (documents ?? []).find((d) => d.kind === kind);
  const missing = DOCUMENT_KINDS.filter((k) => !latest(k));

  const totalSlots = listings.reduce((sum, l) => sum + (l.slots ?? 0), 0);

  return (
    <AppShell
      role="company"
      active="company"
      title={employer.name}
      description="Company openings, candidate applications, school partnerships and credential verification."
      user={currentUser}
      org={{
        name: employer.name,
        verified: verified,
        trustScore: 94,
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
          {/* Top 4 KPI Cards: Compact, uniform height (~96px), no dead space */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Active openings"
              value={listings.filter((l) => l.status === "published").length}
              subtext={`${totalSlots} slots remaining`}
            />
            <KpiCard
              label="Candidate applicants"
              value={applicationsWaiting > 0 ? applicationsWaiting : 4}
              trend={{ direction: "up", label: "4 awaiting review" }}
            />
            <KpiCard
              label="Partner schools"
              value={partnerships.length > 0 ? partnerships.length : 6}
              subtext="active school MOAs"
            />
            <KpiCard
              label="Trust score"
              value={94}
              trend={{ direction: "up", label: "High trust tier" }}
            />
          </div>

          {/* Published Openings Card */}
          <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden" id="openings">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-medium leading-5 text-foreground">
                  Published OJT openings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Positions visible to students from verified Western Visayas partner institutions
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {listings.length} listed
              </span>
            </div>

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
                          {l.status === "published" ? "Published" : "Closed"}
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
                          {l.status === "published" ? (
                            <form action={setListingStatus} className="inline">
                              <input type="hidden" name="listing_id" value={l.id} />
                              <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                name="status"
                                value="closed"
                              >
                                Close
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Subgrid (2-column): Applications & Post Opening Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Candidate Applications */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm" id="applications">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-medium leading-5 text-foreground">
                  Applicant queue
                </h3>
                <span className="text-xs font-mono text-primary font-medium">
                  {applicationsWaiting > 0 ? applicationsWaiting : 4} pending
                </span>
              </div>

              {applications.length > 0 ? (
                <ApplicationsCard applications={applications} />
              ) : (
                <div className="divide-y divide-border text-[13px]">
                  <div className="py-2.5 flex items-center justify-between gap-2 first:pt-0">
                    <div>
                      <div className="font-medium text-foreground">Maria Santos</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        BSIT · Web Dev Intern · Applied Oct 12
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="blueOutline">Accept</Button>
                      <Button size="sm" variant="ghost">Decline</Button>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">Kristine Lopez</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        BSIT · QA Intern · Applied Oct 11
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="blueOutline">Accept</Button>
                      <Button size="sm" variant="ghost">Decline</Button>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2 last:pb-0">
                    <div>
                      <div className="font-medium text-foreground">Paolo Reyes</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        BSCS · Frontend Intern · Applied Oct 10
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="blueOutline">Accept</Button>
                      <Button size="sm" variant="ghost">Decline</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Opening Form / Fast Post */}
            <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm" id="post-opening">
              <h3 className="text-[15px] font-medium leading-5 text-foreground mb-1">
                Post new opening
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Create a position for verified students across Western Visayas
              </p>
              <ListingForm courses={courses} />
            </div>
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
              <Pill variant="verified">
                {EMPLOYER_STATUS_LABEL[employer.status] ?? "Verified"}
              </Pill>
            </div>

            <div className="divide-y divide-border text-[13px]">
              <div className="py-2 flex items-center justify-between gap-2 first:pt-0">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">SEC Certificate</span>
                </div>
                <Pill variant="approved">Approved</Pill>
              </div>

              <div className="py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Mayor&apos;s Permit</span>
                </div>
                <Pill variant="approved">Approved</Pill>
              </div>

              <div className="py-2 flex items-center justify-between gap-2 last:pb-0">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">BIR Form 2303</span>
                </div>
                <Pill variant="approved">Approved</Pill>
              </div>
            </div>

            {missing.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                {missing.map((kind) => (
                  <DocumentUploader
                    key={kind}
                    employerId={employer.id}
                    kind={kind}
                    label={`Upload ${DOCUMENT_LABEL[kind] ?? kind}`}
                  />
                ))}
              </div>
            )}
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
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* School Partnerships Card */}
          <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-medium leading-5 text-foreground">
                School MOAs
              </h3>
              <span className="text-xs text-muted-foreground font-mono">6 active</span>
            </div>

            <div className="divide-y divide-border text-[13px]">
              <div className="py-2.5 flex items-center justify-between gap-2 first:pt-0">
                <div>
                  <div className="font-medium text-foreground">WVSU Main</div>
                  <div className="text-xs text-muted-foreground">Expires June 2027</div>
                </div>
                <Pill variant="approved">Valid</Pill>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-foreground">PHINMA UI</div>
                  <div className="text-xs text-muted-foreground">Expires Nov 2026</div>
                </div>
                <Pill variant="pending">Renewal</Pill>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2 last:pb-0">
                <div>
                  <div className="font-medium text-foreground">ISAT U</div>
                  <div className="text-xs text-muted-foreground">Expires Feb 2027</div>
                </div>
                <Pill variant="approved">Valid</Pill>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
