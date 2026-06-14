import { PackageSearch } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type Props = {
  hasFilters: boolean;

  onResetFilters: () => void;

  onCreateBatch: () => void;
};

export function BatchesEmptyState({
  hasFilters,
  onResetFilters,
  onCreateBatch,
}: Props) {
  return (
    <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <PackageSearch className="size-6 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold">
          {hasFilters ? "No batches found" : "No batches yet"}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {hasFilters
            ? "Try adjusting your filters or search criteria to find batches."
            : "Create your first batch to start organizing courses and instructors."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {hasFilters ? (
            <Button variant="outline" onClick={onResetFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={onCreateBatch}>Create Batch</Button>
          )}
        </div>
      </div>
    </div>
  );
}
