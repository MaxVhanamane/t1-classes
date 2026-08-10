import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function MyEnrollmentsSkeleton() {
  return (
    <div className="space-y-12">
      {/* SECTION 1: Standard Enrollments Skeleton */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card
            key={`enrollment-skel-${idx}`}
            className="flex h-74 flex-col py-3 rounded-xl"
          >
            <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-12 shrink-0 rounded-full" />
              </div>

              {/* Metadata Grid Skeleton (Pushed down matching mt-2) */}
              <div className="mt-2 flex flex-col gap-3.5">
                <div className="flex flex-col gap-3 mt-1">
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="h-3 w-2/3 rounded-md" />
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-2/5 rounded-md" />
                </div>

                {/* Batch Meta Badges (e.g. Online/Offline) */}
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="px-4">
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* SECTION 2: Batch Performance Hub Skeleton */}
      <section className="space-y-4">
        {/* Section Title Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Grid matching BatchPerformanceHub (h-55) */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 1 }).map((_, idx) => (
            <div
              key={`perf-skel-${idx}`}
              className="relative flex h-55 flex-col justify-between overflow-hidden rounded-xl border p-6 bg-card"
            >
              {/* Top content area */}
              <div className="space-y-2">
                {/* Badge/Tag line */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-3 w-28" />
                </div>

                {/* Batch Title */}
                <Skeleton className="h-6 w-3/4" />

                {/* Description lines */}
                <div className="space-y-1 pt-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
              </div>

              {/* Bottom action link line */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
