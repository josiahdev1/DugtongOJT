import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findEmployer, getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { ListingForm, type EditableListing } from "../../../listing-form";

export const dynamic = "force-dynamic";

// A company edits one of its own openings. Row Level Security only returns
// a listing this company owns, so anyone else's id looks like "not found".
export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  const employer = await findEmployer(supabase);
  if (!employer) redirect("/company/setup");
  if (!UUID_RE.test(id)) notFound();

  const [{ data: listing }, { data: courseRows }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, course, role_title, slots, required_hours, schedule, hours_per_day, city, scope_of_tasks, status",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("courses").select("name").order("name"),
  ]);
  if (!listing) notFound();
  const courses = (courseRows ?? []).map((c) => c.name);

  return (
    <AppShell
      role="company"
      active="company"
      title="Edit opening"
      description={`${listing.role_title ?? listing.course} · changes show on the public page straight away if the opening is published.`}
      crumbs={[{ label: "Company", href: "/company" }]}
      user={user}
    >
      <Card className="max-w-3xl">
        <CardHeader className="p-5 pb-3">
          <CardTitle>Opening details</CardTitle>
          <CardDescription>
            Students agree to the scope of tasks you write, so keep it
            accurate. Closing, reopening and publishing are on the Company
            page.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <ListingForm courses={courses} listing={listing as EditableListing} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
