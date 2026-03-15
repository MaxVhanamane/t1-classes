import { Skeleton } from "@/src/components/ui/skeleton";

export function ExploreBatchesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex h-115 flex-col overflow-hidden rounded-2xl border bg-background gap-3"
        >
          {/* IMAGE */}
          <div className="relative aspect-video w-full overflow-hidden shrink-0">
            <Skeleton className="h-full w-full rounded-br-none rounded-bl-none" />
            {/* badge placeholder
            <div className="absolute bottom-2 right-2">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div> */}
          </div>

          {/* CONTENT */}
          <div className="flex flex-1 flex-col gap-2 px-4 pt-0">
            {/* Title */}
            <Skeleton className="h-5 w-4/5" />

            {/* Subtitle */}
            <Skeleton className="h-4 w-3/5" />

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20 " />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 pt-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
