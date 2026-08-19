import { Button } from "@/src/components/ui/button";
import { RefreshButton } from "@/src/components/ui/common/refresh-button";
import { Plus } from "lucide-react";

type Props = {
  onCreate: () => void;
  isFetching: boolean;
  batchId: string;
};

export function BatchAssignmentsHeader({
  isFetching,
  onCreate,
  batchId,
}: Props) {
  return (
    <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Button
          onClick={onCreate}
          className="cursor-pointer flex items-center justify-center gap-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          <p>Assign Material</p>
        </Button>
        <RefreshButton
          isFetching={isFetching}
          size="default"
          queryKey={["admin", "batch-assignments", batchId]}
        />
      </div>
    </div>
  );
}
