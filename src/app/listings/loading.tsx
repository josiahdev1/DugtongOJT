import { Skeleton } from "@/components/ui/skeleton";

// The public openings board has no sidebar, so it gets its own skeleton.
export default function Loading() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-label="Loading">
      <div className="flex h-14 items-center border-b border-border px-4 lg:px-8">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-12">
        <Skeleton className="mx-auto h-10 w-2/3 max-w-xl" />
        <Skeleton className="mx-auto h-12 w-full max-w-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
