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
          className="relative overflow-hidden rounded-3xl border bg-background p-5 dark:bg-black"
        >
          <DottedBackground className="opacity-50" />

          <CardContent className="relative z-10 p-0">
            {/* Top */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-40" />

                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full" />

                  <Skeleton className="h-4 w-12" />

                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Description */}
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Meta */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white/5 p-3">
                <Skeleton className="h-3 w-24" />

                <Skeleton className="mt-3 h-4 w-28" />

                <Skeleton className="mt-2 h-3 w-20" />
              </div>

              <div className="rounded-2xl border bg-white/5 p-3">
                <Skeleton className="h-3 w-20" />

                <Skeleton className="mt-3 h-4 w-24" />

                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            </div>

            {/* Passcode Section */}
            <div className="mt-5 rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-24" />

                  <Skeleton className="mt-3 h-7 w-32" />

                  <Skeleton className="mt-3 h-3 w-full" />

                  <Skeleton className="mt-2 h-3 w-[80%]" />
                </div>

                <Skeleton className="size-10 rounded-xl" />
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
