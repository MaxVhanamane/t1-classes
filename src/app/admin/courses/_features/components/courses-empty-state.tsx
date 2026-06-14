"use client";

import { BookOpen } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type Props = {
  hasFilters: boolean;

  onResetFilters: () => void;

  onCreateCourse: () => void;
};

export function CoursesEmptyState({
  hasFilters,
  onResetFilters,
  onCreateCourse,
}: Props) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <BookOpen className="text-muted-foreground size-8" />
      </div>

      <h2 className="text-xl font-semibold">
        {hasFilters ? "No courses found" : "No courses yet"}
      </h2>

      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {hasFilters
          ? "Try adjusting your filters or search terms to find matching courses."
          : "Create your first course to get started."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <Button variant="outline" onClick={onResetFilters}>
            Reset Filters
          </Button>
        ) : null}

        <Button onClick={onCreateCourse}>Create Course</Button>
      </div>
    </div>
  );
}
