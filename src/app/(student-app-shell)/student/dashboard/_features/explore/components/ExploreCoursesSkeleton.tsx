import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function ExploreCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex h-120 flex-col overflow-hidden p-0">
          {/* Image */}
          <Skeleton className="aspect-video w-full" />

          {/* Content */}
          <CardContent className="flex flex-1 flex-col gap-2 px-4">
            {/* Title (2 lines) */}
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />

            {/* Description (5 lines reserved) */}
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>

            {/* Meta badges (pushed down like real card) */}
            <div className="mt-auto flex gap-2 pt-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-4 pb-6">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
