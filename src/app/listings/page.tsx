import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { parseMinHours, type PublicListing } from "@/lib/listings";
import {
  PARTNERSHIP_STATUS_LABEL,
  type SchoolPartnership,
} from "@/lib/partnerships";
import { requestPartnership } from "../partnerships/actions";

export const metadata = { title: "OJT openings" };
export const dynamic = "force-dynamic";

// Open to everyone, signed in or not. It reads the `public_listings` view,
// which holds only published listings from verified companies and only the
// fields agreed as public: no contact details, documents, notes or
// students.
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; min_hours?: string }>;
}) {
  const params = await searchParams;
  // Signed in or not, anyone can look. A coordinator at a verified school
  // also gets a button to ask a company to partner with them.
  const { supabase, user, school } = await getCurrentUser();
  const canRequest = Boolean(school?.verified);
  const partnershipWith = new Map<string, string>();
  if (canRequest) {
    const { data: mine } = await supabase.rpc("school_partnerships");
    for (const p of (mine ?? []) as SchoolPartnership[]) {
      if (p.employer_id) partnershipWith.set(p.employer_id, p.status);
    }
  }

  const { data: courseRows } = await supabase
    .from("courses")
    .select("name")
    .order("name");
  const courses = (courseRows ?? []).map((c) => c.name);

  // Only filter by a course that really is on the list.
  const course = courses.includes(params.course ?? "") ? params.course : undefined;
  const minHours = parseMinHours(params.min_hours);

  let query = supabase
    .from("public_listings")
    .select("*")
    .order("published_at", { ascending: false });
  if (course) query = query.eq("course", course);
  if (minHours) query = query.gte("required_hours", minHours);

  const { data } = await query;
  const listings = (data ?? []) as PublicListing[];
  const filtered = Boolean(course || minHours);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader signedIn={Boolean(user)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
        <header className="max-w-prose">
          <h1 className="text-3xl text-foreground sm:text-4xl">OJT openings</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Openings posted by verified partner companies. You do not need an
            account to look.
          </p>
        </header>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Filters */}
          <form
            method="get"
            aria-label="Filter openings"
            className="flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 lg:sticky lg:top-20"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <Select id="course" name="course" defaultValue={course ?? ""}>
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="min_hours">At least this many hours</Label>
              <Input
                id="min_hours"
                name="min_hours"
                type="number"
                min={1}
                max={2000}
                defaultValue={minHours ?? ""}
                placeholder="For example 240"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Show openings
              </Button>
              {filtered && (
                <Link href="/listings" className={buttonVariants({ variant: "outline" })}>
                  Clear
                </Link>
              )}
            </div>
          </form>

          {/* Results */}
          <section aria-label="Openings" className="min-w-0">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {listings.length === 0
                ? "No openings match."
                : `${listings.length} ${listings.length === 1 ? "opening" : "openings"}${filtered ? " match your filters" : ""}`}
            </p>

            {listings.length === 0 ? (
              <p className="mt-4 max-w-[56ch] text-sm leading-6 text-muted-foreground">
                {filtered
                  ? "Try a different course, or a smaller number of hours."
                  : "Verified companies post openings here. Check back soon."}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {listings.map((l) => (
                  <li key={l.id}>
                    <article className="flex flex-col gap-4 py-6">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <h2 className="text-xl text-foreground">
                            {l.role_title ?? l.course}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {l.company_name} · {l.city}
                          </p>
                        </div>
                        {l.verified && <Badge variant="verified">Verified company</Badge>}
                      </div>

                      <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Course</dt>
                          <dd className="text-foreground">{l.course}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Required hours</dt>
                          <dd className="font-mono tabular-nums text-foreground">
                            {l.required_hours}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Slots</dt>
                          <dd className="font-mono tabular-nums text-foreground">{l.slots}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Schedule</dt>
                          <dd className="text-foreground">
                            {l.schedule},{" "}
                            <span className="font-mono tabular-nums">
                              {Number(l.hours_per_day)}
                            </span>{" "}
                            hours a day
                          </dd>
                        </div>
                      </dl>

                      <div>
                        <h3 className="font-sans text-xs font-normal tracking-normal text-muted-foreground">
                          What students will do
                        </h3>
                        <p className="mt-1 max-w-[68ch] whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {l.scope_of_tasks}
                        </p>
                      </div>

                      {canRequest &&
                        (partnershipWith.has(l.employer_id) ? (
                          <p className="text-sm text-muted-foreground">
                            Partnership with {l.company_name}:{" "}
                            <span className="font-medium text-foreground">
                              {PARTNERSHIP_STATUS_LABEL[partnershipWith.get(l.employer_id)!]}
                            </span>
                          </p>
                        ) : (
                          <form action={requestPartnership}>
                            <input type="hidden" name="employer_id" value={l.employer_id} />
                            <input type="hidden" name="return_to" value="listings" />
                            <Button type="submit" size="sm" variant="outline">
                              Ask {l.company_name} to partner with my school
                            </Button>
                          </form>
                        ))}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
