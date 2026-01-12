import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function MyEnrollmentsSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} className="flex h-72 flex-col transition">
          <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-[1.45rem] w-3/4" />

              <Skeleton className="h-4.5 w-13 rounded-full" />
            </div>

            {/* Meta (course type OR batch mode/status) */}
            <Skeleton className="h-3 w-24" />

            {/* Context / description */}
            <Skeleton className="h-4 w-full" />

            {/* Optional extra section (batch badges / included courses placeholder) */}
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Access info */}
            <Skeleton className="h-3 w-32" />
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
