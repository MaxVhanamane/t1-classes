"use client";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";

export function QuestionPapersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="relative dark:bg-black">
          <DottedBackground />

          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted size-9 animate-pulse rounded-md" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="bg-muted h-5 w-44 md:w-64 animate-pulse rounded" />

                  <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="bg-muted h-6 w-28 animate-pulse rounded-full" />
                <div className="bg-muted h-6 w-24 animate-pulse rounded-full" />
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="bg-muted h-9 w-full animate-pulse rounded-md sm:w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
