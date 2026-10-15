import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-xs">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-primary-soft">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <Link
        href={actionHref}
        className={buttonVariants({ variant: "outline", size: "sm", className: "mt-6" })}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

