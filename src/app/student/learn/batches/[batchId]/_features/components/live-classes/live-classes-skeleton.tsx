"use client";

import DottedBackground from "@/src/components/dotted-background";

import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function LiveClassesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="relative rounded-lg border py-4 md:w-2xl dark:bg-black"
        >
          <DottedBackground />

          <CardContent className="relative z-10 space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-52" />

                <Skeleton className="h-3 w-full max-w-md" />
              </div>

              <Skeleton className="h-6 w-20 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />

              <Skeleton className="h-3 w-40" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
