import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth";
import { type PublicListing } from "@/lib/listings";
import { ListingsClient, type ListingItem } from "./listings-client";

export const metadata = { title: "OJT Openings — Dugtong OJT" };
export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const { supabase, user } = await getCurrentUser();

  let mappedListings: ListingItem[] | undefined = undefined;

  if (supabase) {
    try {
      const { data } = await supabase
        .from("public_listings")
        .select("*")
        .order("published_at", { ascending: false });

      if (data && data.length > 0) {
        mappedListings = (data as PublicListing[]).map((l) => ({
          id: l.id,
          title: l.role_title || `${l.course} Intern`,
          companyName: l.company_name,
          location: l.city || "Iloilo City",
          workSetup: "On site" as const,
          isVerified: l.verified ?? true,
          requiredCourse: l.course,
          targetHours: l.required_hours,
          slotsRemaining: l.slots ?? 3,
          description: l.scope_of_tasks,
        }));
      }
    } catch {
      // Fallback to default reference listings
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        <ListingsClient initialListings={mappedListings} />
      </main>
    </div>
  );
}
