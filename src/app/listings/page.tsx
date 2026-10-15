import { PublicHeader } from "@/components/public-header";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { type PublicListing } from "@/lib/listings";
import { type SchoolPartnership } from "@/lib/partnerships";
import { ListingsClient, type ListingItem } from "./listings-client";

export const metadata = { title: "OJT Openings — Dugtong OJT" };
export const dynamic = "force-dynamic";

// Open to everyone, signed in or not. It reads the `public_listings` view,
// which holds only published listings from verified companies and only the
// fields agreed as public: no contact details, documents, notes or students.
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user, school } = await getCurrentUser();
  const canRequest = Boolean(school?.verified);

  // A student on a roster can apply. Coordinators and visitors cannot.
  const [student, listingsRes, courseRes] = await Promise.all([
    user && !school ? findStudent(supabase) : Promise.resolve(null),
    supabase
      .from("public_listings")
      .select("*")
      .order("published_at", { ascending: false }),
    supabase.from("courses").select("name").order("name"),
  ]);

  const [applicationsRes, partnershipsRes] = await Promise.all([
    student
      ? supabase
          .from("applications")
          .select("listing_id, status")
          .neq("status", "withdrawn")
      : Promise.resolve({ data: null }),
    canRequest
      ? supabase.rpc("school_partnerships")
      : Promise.resolve({ data: null }),
  ]);

  const appliedTo: Record<string, string> = {};
  for (const a of applicationsRes.data ?? []) appliedTo[a.listing_id] = a.status;

  const partnershipWith: Record<string, string> = {};
  for (const p of (partnershipsRes.data ?? []) as SchoolPartnership[]) {
    if (p.employer_id) partnershipWith[p.employer_id] = p.status;
  }

  const listings: ListingItem[] = ((listingsRes.data ?? []) as PublicListing[]).map(
    (l) => ({
      id: l.id,
      employerId: l.employer_id,
      title: l.role_title ?? l.course,
      companyName: l.company_name,
      city: l.city,
      isVerified: l.verified,
      course: l.course,
      requiredHours: l.required_hours,
      slots: l.slots,
      schedule: l.schedule,
      hoursPerDay: Number(l.hours_per_day),
      description: l.scope_of_tasks,
    }),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        <ListingsClient
          listings={listings}
          courses={(courseRes.data ?? []).map((c) => c.name)}
          role={student ? "student" : canRequest ? "coordinator" : user ? "other" : "visitor"}
          appliedTo={appliedTo}
          partnershipWith={partnershipWith}
          error={params.error}
          message={params.message}
        />
      </main>
    </div>
  );
}
