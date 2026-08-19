"use client";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function BatchHomeworkSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card
          key={i}
          className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm py-1 dark:bg-black w-full md:max-w-2xl"
        >
          <DottedBackground className="opacity-40" />

          <CardContent className="relative z-10 p-4 sm:p-5 flex flex-col flex-1 gap-4">
            {/* --- Top Section: Title & Meta --- */}
            <div className="flex flex-col w-full">
              {/* 1. Title Row: Perfectly centered vertically */}
              <div className="flex items-center justify-between gap-3 w-full">
                {/* Left side: Title + Info Button */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Skeleton className="h-5 sm:h-6 w-3/4 max-w-[240px] sm:max-w-[320px] rounded-md" />
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                </div>

                {/* Right side: Compact Status Badge */}
                <div className="shrink-0">
                  <Skeleton className="h-[20px] sm:h-[22px] w-14 sm:w-16 rounded-md" />
                </div>
              </div>

              {/* 2. Subject & Chapter Row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-3 sm:h-3.5 w-32 rounded-sm" />
                <Skeleton className="h-3 sm:h-3.5 w-24 rounded-sm" />
              </div>
            </div>

            {/* --- Bottom Row: Dates & Actions --- */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 mt-auto">
              {/* Dates */}
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 sm:h-4 w-44 rounded-sm" />
                <Skeleton className="h-3 sm:h-4 w-40 rounded-sm" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full mt-3 sm:mt-0 sm:w-auto">
                <Skeleton className="h-8 flex-1 sm:flex-none sm:w-[104px] rounded-md" />
                <Skeleton className="h-8 flex-1 sm:flex-none sm:w-[104px] rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
