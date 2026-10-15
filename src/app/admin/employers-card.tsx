import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABEL,
  EMPLOYER_STATUS_LABEL,
} from "@/lib/employers";
import { setEmployerStatus } from "./actions";

export type EmployerRow = {
  id: string;
  name: string;
  representative_name: string;
  representative_position: string;
  owner_email: string;
  status: string;
  created_at: string;
  has_registration: boolean;
  has_permit: boolean;
};

export type DocumentRow = {
  id: string;
  employer_id: string;
  kind: string;
  file_name: string;
  created_at: string;
};

// The company accounts waiting for (or already past) review, with a link
// to each document. The links open through /documents/<id>, which makes a
// 60-second signed link only for an admin or the owning company.
export function EmployersCard({
  employers,
  documents,
}: {
  employers: EmployerRow[];
  documents: DocumentRow[];
}) {
  const latest = (employerId: string, kind: string) =>
    documents.find((d) => d.employer_id === employerId && d.kind === kind);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
        <CardDescription>
          A company can post listings only after you verify it. Open both
          documents and check them against the representative before you
          verify. The document list is still to be confirmed against CHED
          and the pilot school&apos;s requirements. Waiting companies are
          listed first.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {employers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No companies yet.</p>
        ) : (
          employers.map((e) => (
            <article
              key={e.id}
              className="flex flex-col gap-3 rounded-[var(--radius)] border border-border p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{e.name}</p>
                <p className="text-sm">
                  {EMPLOYER_STATUS_LABEL[e.status] ?? e.status}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {e.owner_email} · Representative: {e.representative_name},{" "}
                {e.representative_position} · Signed up{" "}
                {e.created_at.slice(0, 10)}
              </p>
              <ul className="flex flex-col gap-1 text-sm">
                {DOCUMENT_KINDS.map((kind) => {
                  const doc = latest(e.id, kind);
                  return (
                    <li key={kind}>
                      {DOCUMENT_LABEL[kind]}:{" "}
                      {doc ? (
                        <Link
                          href={`/documents/${doc.id}`}
                          target="_blank"
                          className="font-medium underline underline-offset-4"
                        >
                          {doc.file_name}
                        </Link>
                      ) : (
                        <span className="text-destructive">not uploaded</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <form action={setEmployerStatus} className="flex flex-wrap gap-2">
                <input type="hidden" name="employer_id" value={e.id} />
                {e.status !== "verified" && (
                  <Button type="submit" size="sm" name="status" value="verified">
                    Verify
                  </Button>
                )}
                {e.status !== "rejected" && (
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    name="status"
                    value="rejected"
                  >
                    Reject
                  </Button>
                )}
                {e.status !== "pending" && (
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    name="status"
                    value="pending"
                  >
                    Back to waiting
                  </Button>
                )}
              </form>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
