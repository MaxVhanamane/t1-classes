import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function ExploreCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex h-115 flex-col overflow-hidden p-0 gap-3">
          {/* Image */}
          <Skeleton className="aspect-video w-full" />

          {/* Content */}
          <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-0 overflow-hidden">
            {/* Title (2 lines reserved always) */}
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />

            {/* Subtitle (2 lines reserved) */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            {/* Tags row */}
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Price (pushed down like real card) */}
            <div className="mt-auto">
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-4 pb-4 shrink-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
