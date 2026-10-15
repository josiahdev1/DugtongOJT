import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  LINK_STATUS_LABEL,
  PARTNERSHIP_STATUS_LABEL,
  type EmployerLinkRequest,
  type EmployerPartnership,
} from "@/lib/partnerships";
import {
  answerLinkRequest,
  answerSchoolRequest,
  requestSchoolPartnership,
} from "./partnership-actions";

// A company's partnerships with schools: requests waiting for its answer,
// ones it sent, and accepted partners, plus a form to ask a school.
export function PartnershipsCard({
  partnerships,
  linkRequests,
  schools,
  verified,
}: {
  partnerships: EmployerPartnership[];
  linkRequests: EmployerLinkRequest[];
  schools: { id: string; name: string }[];
  verified: boolean;
}) {
  const incoming = partnerships.filter(
    (p) => p.status === "requested" && p.requested_by === "school",
  );
  const sent = partnerships.filter(
    (p) => p.status === "requested" && p.requested_by === "employer",
  );
  const decided = partnerships.filter((p) => p.status !== "requested");
  // Schools already in a partnership or request with this company.
  const taken = new Set(partnerships.map((p) => p.school_id));
  const available = schools.filter((s) => !taken.has(s.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partnerships with schools</CardTitle>
        <CardDescription>
          {verified
            ? "A school can ask to partner with your company, or you can ask a school. Only the side that received a request can accept it."
            : "You can send and receive partnership requests once the Dugtong team verifies your company."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Requests from schools</p>
          {incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No requests are waiting.
            </p>
          ) : (
            incoming.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3"
              >
                <p className="text-sm">
                  <span className="font-medium">{p.school_name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · asked {p.created_at.slice(0, 10)}
                  </span>
                </p>
                <form action={answerSchoolRequest} className="flex gap-2">
                  <input type="hidden" name="partnership_id" value={p.id} />
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
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Link requests from schools</p>
            <p className="text-xs text-muted-foreground">
              A school already placed students with you before you joined
              Dugtong, and asks to link that placement to your account. If you
              accept, your account can see the students placed there, and
              their hours, reports and evaluations stay as they are. Only
              accept if the school really placed students with your company.
            </p>
          </div>
          {linkRequests.filter((l) => l.status === "requested").length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No link requests are waiting.
            </p>
          ) : (
            linkRequests
              .filter((l) => l.status === "requested")
              .map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3"
                >
                  <p className="text-sm">
                    <span className="font-medium">{l.school_name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · placed students with &ldquo;{l.company_name}&rdquo; · asked{" "}
                      {l.created_at.slice(0, 10)}
                    </span>
                  </p>
                  <form action={answerLinkRequest} className="flex gap-2">
                    <input type="hidden" name="link_id" value={l.id} />
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
                </div>
              ))
          )}
          {linkRequests.some((l) => l.status !== "requested") && (
            <ul className="text-sm text-muted-foreground">
              {linkRequests
                .filter((l) => l.status !== "requested")
                .map((l) => (
                  <li key={l.id}>
                    {l.school_name} · {LINK_STATUS_LABEL[l.status]}{" "}
                    {l.decided_at?.slice(0, 10)}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {verified && (
          <form
            action={requestSchoolPartnership}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="school_id">Ask a school to partner with you</Label>
            <div className="flex gap-2">
              <Select id="school_id" name="school_id" required defaultValue="">
                <option value="" disabled>
                  {available.length === 0
                    ? "No more schools to ask"
                    : "Choose a school…"}
                </option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" disabled={available.length === 0}>
                Send request
              </Button>
            </div>
          </form>
        )}

        {sent.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Waiting for a school to answer</p>
            <ul className="text-sm text-muted-foreground">
              {sent.map((p) => (
                <li key={p.id}>
                  {p.school_name} · asked {p.created_at.slice(0, 10)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {decided.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Answered</p>
            <ul className="text-sm">
              {decided.map((p) => (
                <li
                  key={p.id}
                  className={p.status === "declined" ? "text-muted-foreground" : undefined}
                >
                  {p.school_name} · {PARTNERSHIP_STATUS_LABEL[p.status]}{" "}
                  {p.decided_at?.slice(0, 10)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
