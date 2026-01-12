import { Skeleton } from "@/src/components/ui/skeleton";

export function ExploreBatchesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex h-96 flex-col rounded-xl border bg-background"
        >
          <div className="flex flex-1 flex-col gap-3 px-4 py-4">
            {/* Title */}
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />

            {/* Badges */}
            <Skeleton className="h-4 w-32 rounded-full" />

            {/* Date */}
            <Skeleton className="h-3 w-40" />

            {/* Course count */}
            <Skeleton className="h-4 w-44 rounded-full" />

            {/* Description (5 lines) */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/6" />
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
