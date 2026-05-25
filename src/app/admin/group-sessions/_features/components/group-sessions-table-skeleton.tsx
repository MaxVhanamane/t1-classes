import { Skeleton } from "@/src/components/ui/skeleton";

export function GroupSessionsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-275">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_1.5fr_1.5fr] gap-4 border-b bg-muted/40 px-6 py-4">
            <Skeleton className="h-4 w-32" />

            <Skeleton className="h-4 w-20" />

            <Skeleton className="h-4 w-28" />

            <Skeleton className="h-4 w-24" />

            <Skeleton className="h-4 w-16" />

            <Skeleton className="h-4 w-20" />

            <Skeleton className="h-4 w-20" />
          </div>

          {/* Rows */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_1.5fr_1.5fr] gap-4 border-b px-6 py-5 last:border-b-0"
            >
              {/* Session Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />

                <Skeleton className="h-3 w-60" />
              </div>

              {/* Audience */}
              <div className="flex items-center">
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>

              {/* Duration */}
              <div className="flex items-center">
                <Skeleton className="h-4 w-14" />
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-3 w-20" />
              </div>

              {/* Status */}
              <div className="flex items-center">
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>

              {/* Meeting */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-36" />

                <Skeleton className="h-9 w-32 rounded-xl" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-xl" />

                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-24 rounded-xl" />

        <Skeleton className="h-4 w-32" />

        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}
