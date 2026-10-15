import { Skeleton } from "@/components/ui/skeleton";

// Shown while a signed-in screen is still loading. It has the same frame as
// the real page (sidebar, top bar, title, content) so nothing jumps when the
// real page arrives.
export function ShellSkeleton({ kpis = 0, rows = 6 }: { kpis?: number; rows?: number }) {
  return (
    <div
      className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]"
      role="status"
      aria-label="Loading"
    >
      <aside className="hidden border-r border-border bg-surface p-5 lg:block">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-16 w-full" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
          <div>
            <Skeleton className="h-9 w-56" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
          </div>
          {kpis > 0 && (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {Array.from({ length: kpis }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border p-5">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
