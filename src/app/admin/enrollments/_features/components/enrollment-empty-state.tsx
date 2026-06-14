"use client";

import { Button } from "@/src/components/ui/button";

type Props = {
  hasFilters: boolean;

  onResetFilters: () => void;

  onCreateEnrollment: () => void;
};

export function EnrollmentEmptyState({
  hasFilters,
  onResetFilters,
  onCreateEnrollment,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <h3 className="text-lg font-semibold">
        {hasFilters ? "No enrollments found" : "No enrollments yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting or clearing your filters to see more enrollments."
          : "Create your first enrollment to start managing student access."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            Reset Filters
          </Button>
        )}

        <Button onClick={onCreateEnrollment}>Create Enrollment</Button>
      </div>
    </div>
  );
}
