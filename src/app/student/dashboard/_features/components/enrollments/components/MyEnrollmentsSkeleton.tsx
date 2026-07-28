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
            className="flex h-72 flex-col py-5"
          >
            <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-12 rounded-full shrink-0" />
              </div>

              {/* Subtitle */}
              <Skeleton className="h-3 w-1/2" />

              {/* Meta / badges */}
              <Skeleton className="h-4 w-28 rounded-full" />

              {/* Supporting text */}
              <Skeleton className="h-3 w-2/3" />

              {/* Spacer to push dates down */}
              <div className="flex-1" />
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
