"use client";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function BatchTestsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card
          key={i}
          className="relative rounded-lg border py-4 transition md:w-2xl dark:bg-black"
        >
          <DottedBackground />

          <CardContent className="z-10 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-52" />

              <Skeleton className="h-6 w-20 rounded-md" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-3 w-28" />

              <div className="flex flex-wrap gap-6">
                <Skeleton className="h-3 w-36" />

                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
