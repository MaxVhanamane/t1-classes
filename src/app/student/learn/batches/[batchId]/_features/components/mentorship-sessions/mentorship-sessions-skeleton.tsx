"use client";

import DottedBackground from "@/src/components/dotted-background";

import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function MentorshipSessionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="relative overflow-hidden rounded-3xl border bg-background p-5 dark:bg-black"
        >
          <DottedBackground className="opacity-50" />

          <CardContent className="relative z-10 p-0">
            {/* Top */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-40 rounded-md" />

                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full" />

                  <Skeleton className="h-4 w-16 rounded" />

                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>

              <Skeleton className="h-6 w-20 rounded-md" />
            </div>

            {/* Description */}
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full rounded" />

              <Skeleton className="h-4 w-[80%] rounded" />
            </div>

            {/* Meta Section */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white/5 p-3">
                <Skeleton className="h-3 w-24 rounded" />

                <Skeleton className="mt-3 h-4 w-24 rounded" />

                <Skeleton className="mt-2 h-3 w-16 rounded" />
              </div>

              <div className="rounded-2xl border bg-white/5 p-3">
                <Skeleton className="h-3 w-20 rounded" />

                <Skeleton className="mt-3 h-4 w-20 rounded" />

                <Skeleton className="mt-2 h-3 w-24 rounded" />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6">
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
