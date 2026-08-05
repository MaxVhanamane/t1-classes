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
          className="relative overflow-hidden rounded-xl border py-3 shadow-sm dark:bg-black md:max-w-2xl"
        >
          <DottedBackground />

          <CardContent className="relative z-10 flex flex-col px-4 py-2 sm:px-5">
            {/* === TITLE & SUBTITLE === */}
            <div className="flex items-start justify-between gap-4">
              {/* Changed from gap-1.5 to gap-1 to match UI exactly */}
              <div className="flex min-w-0 flex-col gap-1">
                {/* Title (matches text-base sm:text-lg) */}
                <Skeleton className="h-6 w-48 sm:h-7 sm:w-64 rounded-md" />
                {/* Subjects Subtitle (matches text-xs sm:text-sm) */}
                <Skeleton className="h-4 w-32 sm:h-5 sm:w-40 rounded-sm" />
              </div>

              {/* Status Badge (matches px-2.5 py-0.5 text-[10px] -> ~20px height) */}
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </div>

            {/* === METADATA (2x2 Grid) === */}
            {/* text-xs line-height is 16px, so h-4 is the exact match */}
            <div className="mt-4 grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-2.5 sm:gap-x-10">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>

            {/* === BOTTOM ROW (Dates & Action Button) === */}
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-1.5">
                {/* Starts At (matches text-[11px] sm:text-xs -> 16px height) */}
                <Skeleton className="h-4 w-36 sm:w-40 rounded-sm" />
                {/* Ends At */}
                <Skeleton className="h-4 w-36 sm:w-40 rounded-sm" />
              </div>

              {/* Action Button (matches button size="sm" -> h-9) */}
              <Skeleton className="h-9 w-full shrink-0 rounded-md sm:w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
