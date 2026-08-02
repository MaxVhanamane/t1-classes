"use client";

import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function DistributionRowCardSkeleton() {
  return (
    <Card className="p-4 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Content */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Test title & Badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-3/4 max-w-[260px]" />
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
          </div>

          {/* Stats Row (Sections, Questions, Marks) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Metadata Block */}
          <div className="mt-1 flex flex-col gap-1.5">
            {/* Batch name */}
            <Skeleton className="h-4 w-56" />

            {/* Subjects */}
            <Skeleton className="h-4 w-48" />

            {/* Dates */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {/* Status badge */}
          <Skeleton className="h-5 w-20 rounded-full" />

          {/* Action buttons (size="sm" = h-8) */}
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

interface Props {
  count?: number;
}

export function DistributionListSkeleton({ count = 5 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <DistributionRowCardSkeleton key={index} />
      ))}
    </div>
  );
}
