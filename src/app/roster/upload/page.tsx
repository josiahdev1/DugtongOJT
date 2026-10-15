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

export const dynamic = "force-dynamic";

export default async function UploadRosterPage() {
  const { user, school, supabase } = await getCurrentUser();

  if (!user) redirect("/login");
  if (!school) redirect("/");

  const { count } = await supabase
    .from("companies")
    .select("id", { count: "exact", head: true });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/dashboard"
        className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Upload roster</CardTitle>
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
    </main>
  );
}
