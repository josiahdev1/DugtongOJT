import * as React from "react";
import Link from "next/link";
import { Pill } from "./pill";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ListingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workSetup?: "On site" | "Hybrid" | "Remote";
  isVerified?: boolean;
  requiredCourse: string;
  targetHours: number;
  slotsRemaining: number;
  onApply?: () => void;
  applyHref?: string;
}

export function ListingCard({
  title,
  companyName,
  location,
  workSetup = "On site",
  isVerified = true,
  requiredCourse,
  targetHours,
  slotsRemaining,
  onApply,
  applyHref,
  className,
  ...props
}: ListingCardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card p-5 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)]",
        "transition-all duration-150 hover:border-primary/35 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold leading-tight text-foreground tracking-tight">
          {title}
        </h3>
        {isVerified && <Pill variant="verified">Verified</Pill>}
      </div>

      <div className="mt-1 text-[13px] text-muted-foreground">
        {companyName} · {location} {workSetup ? `· ${workSetup}` : ""}
      </div>

      <div className="my-3.5 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-3 text-[13px]">
        <div>
          <span className="block text-xs text-muted-foreground">Required course</span>
          <b className="font-medium text-foreground">{requiredCourse}</b>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">Target hours</span>
          <b className="font-mono font-medium text-foreground">{targetHours} hours</b>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Pill variant="trust">
          {slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"} left
        </Pill>

        {applyHref ? (
          <Link href={applyHref}>
            <Button variant="primary" size="sm">
              Apply for placement
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="sm" onClick={onApply}>
            Apply for placement
          </Button>
        )}
      </div>
    </div>
  );
}

