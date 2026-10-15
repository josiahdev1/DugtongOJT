import { Skeleton } from "@/components/ui/skeleton";

// Inner content skeleton shown while an admin screen is loading data.
// The persistent sidebar and topbar stay permanently mounted in layout.tsx,
// so only the interior content area pulses smoothly.
export default function AdminLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      role="status"
      aria-label="Loading admin content"
    >
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton (4-up on desktop, 2-up on mobile/tablet) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Content Block / Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
