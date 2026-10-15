import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { parseMinHours, type PublicListing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/login"
          className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          OJT openings
        </h1>
        <p className="text-sm text-muted-foreground">
          Openings posted by verified partner companies. You do not need an
          account to look.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>
            Show openings for a course, and openings that offer at least a
            number of hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 sm:grid-cols-3 sm:items-end">
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
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={buttonVariants()}>
                Show openings
              </button>
              <Link
                href="/listings"
                className={buttonVariants({ variant: "outline" })}
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No openings match.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((l) => (
            <Card key={l.id}>
              <CardHeader>
                <CardTitle>{l.role_title ?? l.course}</CardTitle>
                <CardDescription>
                  {l.company_name} ·{" "}
                  <span className="font-medium">
                    {l.verified ? "✓ Verified company" : ""}
                  </span>{" "}
                  · {l.city}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Course</dt>
                    <dd>{l.course}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Slots</dt>
                    <dd className="tabular-nums">{l.slots}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Required hours</dt>
                    <dd className="tabular-nums">{l.required_hours}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Schedule · hours per day
                    </dt>
                    <dd>
                      {l.schedule} ·{" "}
                      <span className="tabular-nums">{Number(l.hours_per_day)}</span>{" "}
                      h/day
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-xs text-muted-foreground">
                    What students will do
                  </p>
                  <p className="whitespace-pre-wrap">{l.scope_of_tasks}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
