import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id?: string | number;
  label: string;
  status?: "done" | "current" | "upcoming" | string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  currentStepIndex?: number; // 0-indexed
}

export function Stepper({
  steps,
  currentStepIndex,
  className,
  ...props
}: StepperProps) {
  const activeIndex =
    typeof currentStepIndex === "number"
      ? currentStepIndex
      : Math.max(0, steps.findIndex((s) => s.status === "current"));

  return (
    <div className={cn("w-full space-y-2", className)} {...props}>
      {/* Circle & line track */}
      <div className="flex items-center gap-2 text-xs">
        {steps.map((step, idx) => {
          const isDone = step.status === "done" || idx < activeIndex;
          const isCurrent = step.status === "current" || idx === activeIndex;

          return (
            <React.Fragment key={step.id ?? idx}>
              {idx > 0 && (
                <hr className="flex-1 border-0 border-t-[1.5px] border-foreground/15 dark:border-muted-foreground/25" />
              )}
              <div
                className={cn(
                  "size-[22px] rounded-full grid place-items-center text-[11px] font-medium border-[1.5px] shrink-0 transition-colors",
                  isDone && "bg-primary border-primary text-white",
                  isCurrent && "border-primary text-primary font-bold dark:border-primary dark:text-[#6C9BFF]",
                  !isDone && !isCurrent && "border-foreground/20 dark:border-muted-foreground/35 text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? (
                  <Check className="size-3 stroke-[2.8]" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        {steps.map((step, idx) => {
          const isDone = step.status === "done" || idx < activeIndex;
          const isCurrent = step.status === "current" || idx === activeIndex;
          return (
            <span
              key={step.id ?? idx}
              className={cn(
                "transition-colors",
                isCurrent && "text-primary font-semibold dark:text-[#6C9BFF]",
                isDone && "text-foreground font-medium",
              )}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

