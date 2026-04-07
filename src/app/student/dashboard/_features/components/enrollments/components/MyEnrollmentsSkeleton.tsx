import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function MyEnrollmentsSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 2 }).map((_, idx) => (
        <Card key={idx} className="flex h-72 flex-col py-5">
          <CardContent className="flex flex-1 flex-col gap-3 px-4 py-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-12 rounded-full shrink-0" />
            </div>

            {/* Subtitle (optional in real UI) */}
            <Skeleton className="h-3 w-1/2" />

            {/* Meta / badges */}
            <Skeleton className="h-4 w-28 rounded-full" />

            {/* Supporting text */}
            <Skeleton className="h-3 w-2/3" />

            {/* Spacer to push dates down */}
            <div className="flex-1" />

            {/* Bottom info row (dates / access) */}
            {/* <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div> */}
          </CardContent>

          {/* Footer (UNCHANGED POSITION ✅) */}
          <CardFooter className="px-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
