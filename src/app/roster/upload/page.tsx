import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { UploadForm } from "./upload-form";
import { AppShell } from "@/components/app-shell/app-shell";

export const dynamic = "force-dynamic";

export default async function UploadRosterPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/");

  const { count } = await supabase
    .from("companies")
    .select("id", { count: "exact", head: true });

  return (
    <AppShell
      role="coordinator"
      active="roster"
      title="Upload roster"
      description="Add students from a CSV file. If any row is wrong, nothing is imported."
      crumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      user={user}
      org={{ name: school.name, verified: school.verified }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Choose a CSV file</CardTitle>
          <CardDescription>
            Each student&apos;s company must already be on your Companies
            page. If one bad row is found, nothing is imported.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {count === 0 ? (
            <p className="text-sm">
              You have no companies yet.{" "}
              <Link
                href="/companies"
                className="font-medium underline underline-offset-4"
              >
                Add a company first
              </Link>
              , then come back.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Want to try it first?{" "}
                <a
                  href="/sample-roster.csv"
                  download
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Download the sample file
                </a>
                . It uses a company called &quot;Sample Company&quot;, so add
                that company before uploading it.
              </p>
              <UploadForm />
            </>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
