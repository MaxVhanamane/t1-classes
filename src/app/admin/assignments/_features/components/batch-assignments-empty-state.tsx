import { SearchX, FilePlus2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

type Props = {
  hasFilters: boolean;
  onResetFilters: () => void;
  onCreateAssignment: () => void;
};

export function BatchAssignmentsEmptyState({
  hasFilters,
  onResetFilters,
  onCreateAssignment,
}: Props) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <SearchX className="mb-4 size-10 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">No assignments found</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          No materials match your current filters.
        </p>
        <Button variant="outline" onClick={onResetFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <FilePlus2 className="mb-4 size-10 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-medium">No materials assigned</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Get started by assigning homework or study materials to this batch.
      </p>
      <Button onClick={onCreateAssignment}>Assign Material</Button>
    </div>
  );
}
