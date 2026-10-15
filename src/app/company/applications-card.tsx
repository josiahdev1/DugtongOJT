import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  APPLICATION_STATUS_LABEL,
  type EmployerApplication,
} from "@/lib/applications";
import { answerApplication } from "./application-actions";

// Students who applied for this company's openings. A company sees the
// student's name, ID, course and school, never their email. Accepting does
// not place the student: their school's coordinator still deploys them.
export function ApplicationsCard({
  applications,
}: {
  applications: EmployerApplication[];
}) {
  return (
    <Card>
      <CardHeader className="p-5 pb-3">
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          Students who applied for your openings. If you accept, the
          student&apos;s school coordinator can place them with you. They are
          not placed until then.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-5 pt-0">
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No student has applied yet. Applications appear here when a
            student applies for one of your published openings.
          </p>
        ) : (
          applications.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-2 rounded-[8px] border border-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {a.student_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{a.student_no}</span> ·{" "}
                    {a.course} · {a.school_name}
                  </p>
                </div>
                <Badge
                  variant={
                    a.status === "accepted"
                      ? "approved"
                      : a.status === "declined"
                        ? "secondary"
                        : "pending"
                  }
                >
                  {a.status === "sent"
                    ? "Waiting for you"
                    : APPLICATION_STATUS_LABEL[a.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                For {a.listing_title} · applied{" "}
                <span className="font-mono tabular-nums">
                  {a.created_at.slice(0, 10)}
                </span>
              </p>
              {a.note && (
                <p className="whitespace-pre-wrap text-sm">{a.note}</p>
              )}
              {a.status === "sent" && (
                <form action={answerApplication} className="flex gap-2">
                  <input type="hidden" name="application_id" value={a.id} />
                  <Button type="submit" size="sm" name="accept" value="true">
                    Accept
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    name="accept"
                    value="false"
                  >
                    Decline
                  </Button>
                </form>
              )}
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
