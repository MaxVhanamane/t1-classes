import { Skeleton } from "@/src/components/ui/skeleton";
import { Separator } from "@/src/components/ui/separator";

export function TopicContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Topic title (from searchParams) */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" /> {/* "Topic content" */}
          <Skeleton className="h-4 w-72" /> {/* subtitle */}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-28 rounded-md" /> {/* Add Video */}
          <Skeleton className="h-9 w-28 rounded-md" /> {/* Add PDF */}
          <Skeleton className="h-9 w-32 rounded-md" /> {/* Add Practice */}
        </div>
      </div>

      <Separator />

      {/* Video list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-md border p-3 space-y-3">
            {/* Video header row */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" /> {/* video title */}
                <Skeleton className="h-3 w-32" /> {/* provider / duration */}
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-6" /> {/* sort order */}
                <Skeleton className="h-8 w-20 rounded-md" /> {/* Play button */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
