"use client";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function AttendanceSkeleton() {
  return (
    <Card className="relative overflow-hidden border bg-linear-to-br from-background via-background to-muted/30 backdrop-blur">
      <DottedBackground />

      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 bg-muted/70" />
          <Skeleton className="h-14 w-40 bg-muted/70" />
          <Skeleton className="h-4 w-28 bg-muted/70" />
        </div>

        <Skeleton className="mt-6 h-3 w-full rounded-full bg-muted/70" />

        <div className="mt-8 grid grid-cols-3 gap-4 pt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14 bg-muted/70" />
              <Skeleton className="h-8 w-16 bg-muted/70" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
