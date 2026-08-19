"use client";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function GroupSessionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="relative flex flex-col overflow-hidden rounded-3xl border bg-background p-4 sm:p-5 transition hover:bg-muted/40 dark:bg-black"
        >
          {/* Background Pattern */}
          <DottedBackground className="opacity-50" />

          {/* Main Content Area */}
          <CardContent className="relative z-10 flex flex-col flex-1 p-0">
            {/* Top Header Section */}
            <div className="min-w-0 w-full">
              {/* Title */}
              <Skeleton className="h-5 sm:h-6 w-3/4 max-w-[260px] rounded-md" />

              <div className="mt-2.5 flex items-center gap-3 w-full">
                {/* Host Row */}
                <div className="flex items-center gap-1.5 shrink min-w-0">
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3 sm:h-3.5 w-10 rounded-sm shrink-0" />
                  <Skeleton className="h-3 sm:h-3.5 w-24 rounded-sm" />
                </div>

                {/* Interactive Personal Badge */}
                <div className="shrink-0">
                  <Skeleton className="h-5 sm:h-[22px] w-[72px] rounded-md" />
                </div>
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
                <Skeleton className="h-2.5 sm:h-3 w-20 rounded-sm" />
                <Skeleton className="mt-1.5 h-3.5 sm:h-4 w-24 rounded-sm" />
                <Skeleton className="mt-1 h-2.5 sm:h-3 w-16 rounded-sm" />
              </div>

              {/* Duration Card */}
              <div className="rounded-2xl border bg-white/5 p-2.5 sm:p-3">
                <Skeleton className="h-2.5 sm:h-3 w-20 rounded-sm" />
                <Skeleton className="mt-1.5 h-3.5 sm:h-4 w-16 rounded-sm" />
                <Skeleton className="mt-1 h-2.5 sm:h-3 w-24 rounded-sm" />
              </div>
            </div>

            {/* Compact Zoom Passcode Box */}
            <div className="mt-4 rounded-2xl border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-2.5 sm:h-3 w-24 rounded-sm" />
                  <Skeleton className="mt-1.5 h-5 sm:h-6 w-32 rounded-sm" />
                  <Skeleton className="mt-1.5 h-2.5 sm:h-3 w-[90%] rounded-sm" />
                </div>
                <Skeleton className="shrink-0 size-8 sm:size-9 rounded-xl" />
              </div>
            </div>

            {/* Footer Actions (Pushed to bottom, full width) */}
            <div className="mt-auto pt-6">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
