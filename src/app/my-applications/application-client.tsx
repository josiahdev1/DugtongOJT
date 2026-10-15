"use client";

import Link from "next/link";
import { Button, EmptyState, Pill, Stepper, ToastCard } from "@/components/ui";
import { buttonVariants } from "@/components/ui/button";
import { APPLICATION_STATUS_LABEL, type MyApplication } from "@/lib/applications";
import { withdrawApplication } from "./actions";

const PILL: Record<
  MyApplication["status"],
  "pending" | "approved" | "rejected" | "neutral"
> = {
  sent: "pending",
  accepted: "approved",
  declined: "rejected",
  withdrawn: "neutral",
};

// Real stages from the application status. "Deploy" is done by the
// coordinator and is not tracked on the application, so it is never marked done.
function stepsFor(status: MyApplication["status"]) {
  const labels = ["Applied", "Company answer", "Deploy"];
  const current = status === "sent" ? 1 : 2;
  return {
    current,
    steps: labels.map((label) => ({ label })),
  };
}

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export function ApplicationClient({
  applications,
}: {
  applications: MyApplication[];
}) {
  if (applications.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[375px] rounded-[12px] border border-border bg-card shadow-sm">
        <EmptyState
          title="No applications yet"
          description="You have not applied for anything yet. Find an opening and apply."
          action={
            <Link href="/listings" className={buttonVariants({ size: "sm" })}>
              Browse openings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      {applications.map((a) => {
        const { steps, current } = stepsFor(a.status);
        const active = a.status === "sent" || a.status === "accepted";
        return (
          <div key={a.id} className="flex flex-col gap-4">
            <article className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">
                    {a.listing_title}
                  </h2>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {a.company_name} · applied{" "}
                    <span className="font-mono tabular-nums">
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                </div>
                <Pill variant={PILL[a.status]}>
                  {APPLICATION_STATUS_LABEL[a.status]}
                </Pill>
              </div>

              {active && (
                <div className="mt-5 mb-2">
                  <Stepper steps={steps} currentStepIndex={current} />
                </div>
              )}

              {a.note && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.note}
                </p>
              )}

              {a.status === "sent" && (
                <form action={withdrawApplication} className="mt-3.5">
                  <input type="hidden" name="application_id" value={a.id} />
                  <Button
                    type="submit"
                    variant="blueOutline"
                    className="w-full py-2 text-xs font-medium"
                  >
                    Withdraw application
                  </Button>
                </form>
              )}
            </article>

            {a.status === "accepted" && (
              <ToastCard
                title="Accepted by the company."
                message="You are not placed until your school coordinator deploys you to that company."
                accent="primary"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
