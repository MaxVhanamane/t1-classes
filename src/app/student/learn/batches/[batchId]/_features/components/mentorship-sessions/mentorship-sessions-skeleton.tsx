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
          className="relative flex flex-col overflow-hidden rounded-3xl border bg-background p-4 sm:p-5 dark:bg-black"
        >
          <DottedBackground className="opacity-50" />

          <CardContent className="relative z-10 flex flex-col flex-1 p-0">
            {/* Top Header Section */}
            <div className="min-w-0 w-full">
              {/* Title (matches text-sm sm:text-base) */}
              <Skeleton className="h-5 sm:h-6 w-3/4 max-w-[260px] rounded-md" />

              {/* Mentor Row */}
              <div className="mt-2 flex items-center gap-1.5">
                <Skeleton className="size-3.5 shrink-0 rounded-full" />
                <Skeleton className="h-3 sm:h-3.5 w-12 rounded-sm" />
                <Skeleton className="h-3 sm:h-3.5 w-24 rounded-sm" />
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-3.5 space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3 sm:h-3.5 w-full rounded-sm" />
              <Skeleton className="h-3 sm:h-3.5 w-[80%] rounded-sm" />
            </div>

            {/* Metadata Cards Grid */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {/* Date Card */}
              <div className="rounded-2xl border bg-white/5 p-2.5 sm:p-3">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <Skeleton className="mt-1.5 h-3.5 sm:h-4 w-24 rounded-sm" />
                <Skeleton className="mt-1 h-2.5 sm:h-3 w-16 rounded-sm" />
              </div>

              {/* Duration Card */}
              <div className="rounded-2xl border bg-white/5 p-2.5 sm:p-3">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <Skeleton className="mt-1.5 h-3.5 sm:h-4 w-16 rounded-sm" />
                <Skeleton className="mt-1 h-2.5 sm:h-3 w-24 rounded-sm" />
              </div>
            </div>

            {/* Footer Actions (Pushed to bottom, strictly right-aligned) */}
            <div className="mt-auto pt-5 flex items-center justify-end">
              <Skeleton className="h-9 sm:h-10 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
