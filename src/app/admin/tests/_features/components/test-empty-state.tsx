"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type Props = {
  hasFilters: boolean;

  onResetFilters: () => void;
};

export function TestsEmptyState({ hasFilters, onResetFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="size-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold">
        {hasFilters ? "No tests found" : "No tests yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or filter criteria to find the tests you're looking for."
          : "Create your first test to start building reusable assessments for students."}
      </p>

      {hasFilters && (
        <Button variant="outline" className="mt-6" onClick={onResetFilters}>
          Reset Filters
        </Button>
      )}
    </div>
  );
}
