"use client";

import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
export function DistributionRowCardSkeleton() {
  return (
    <Card className="p-4 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Content */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Test title */}
          <Skeleton className="h-5 w-64 max-w-full" />

          {/* Batch name */}
          <Skeleton className="h-4 w-40" />

          {/* Dates */}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-44" />

            <Skeleton className="h-4 w-44" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {/* Status badge */}
          <Skeleton className="h-6 w-24 rounded-full" />

          {/* Action buttons */}
          <Skeleton className="h-9 w-20 rounded-md" />

          <Skeleton className="h-9 w-20 rounded-md" />
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
