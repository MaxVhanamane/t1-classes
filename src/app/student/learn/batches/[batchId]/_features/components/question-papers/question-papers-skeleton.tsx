"use client";

import { cn } from "@/src/lib/utils";

import DottedBackground from "@/src/components/dotted-background";
import { Card, CardContent } from "@/src/components/ui/card";

type QuestionPapersSkeletonProps = {
  layout?: "batch" | "course";
};

export function QuestionPapersSkeleton({
  layout = "batch",
}: QuestionPapersSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="relative py-4 dark:bg-black">
          <DottedBackground />

          <CardContent
            className={cn(
              "flex flex-col gap-4 p-4",
              layout === "batch" &&
                "sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted size-9 shrink-0 animate-pulse rounded-md" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />

                  <div className="bg-muted h-4 w-full max-w-md animate-pulse rounded" />

                  <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="bg-muted h-6 w-28 animate-pulse rounded-full" />
                <div className="bg-muted h-6 w-24 animate-pulse rounded-full" />
                <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
                <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
              </div>
            </div>

            <div
              className={cn(
                "bg-muted mt-2 h-10 w-full animate-pulse rounded-md",
                layout === "batch" && "sm:mt-0 sm:w-28",
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
