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
import { signOut } from "../login/actions";
import { DocumentUploader } from "./document-uploader";

export const dynamic = "force-dynamic";

const STATUS_NOTE: Record<string, string> = {
  pending:
    "The Dugtong team will check your documents. You cannot post anything until your company is verified.",
  verified: "Your company is verified.",
  rejected:
    "Your company was not verified. Check that your documents are clear and correct, upload them again, and contact the Dugtong team.",
};

export default async function CompanyPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  const employer = await findEmployer(supabase);
  if (!employer) redirect("/company/setup");

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
    </main>
  );
}
