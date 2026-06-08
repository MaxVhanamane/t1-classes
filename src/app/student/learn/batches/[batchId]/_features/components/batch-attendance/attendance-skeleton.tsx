"use client";

import DottedBackground from "@/src/components/dotted-background";

import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export function AttendanceSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32 bg-muted/70" />

          <Skeleton className="h-4 w-52 bg-muted/70" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 bg-muted/70" />

          <Skeleton className="h-9 w-24 bg-muted/70" />
        </div>
      </div>

      {/* Attendance Hero Card */}
      <Card className="relative overflow-hidden border bg-linear-to-br from-background via-background to-muted/30 backdrop-blur">
        <DottedBackground />

        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-muted/70" />

            <Skeleton className="h-14 w-40 bg-muted/70" />

            <Skeleton className="h-4 w-28 bg-muted/70" />
          </div>

          <Skeleton className="mt-6 h-3 w-full rounded-full bg-muted/70" />

          <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-14 bg-muted/70" />

                <Skeleton className="h-8 w-16 bg-muted/70" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40 bg-muted/70" />

          <Skeleton className="h-4 w-16 bg-muted/70" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="relative">
              <DottedBackground />

              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-muted/70" />

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28 bg-muted/70" />

                      <Skeleton className="h-3 w-20 bg-muted/70" />
                    </div>
                  </div>

                  <Skeleton className="h-6 w-20 rounded-full bg-muted/70" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
