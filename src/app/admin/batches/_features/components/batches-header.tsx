// _components/batches-header.tsx

import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
type Props = {
  onCreate: () => void;
};

export function BatchesHeader({ onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Batches</h1>

      <Button
        onClick={onCreate}
        className="cursor-pointer flex items-center justify-center gap-0"
      >
        <Plus className="h-4 w-4 mr-2" />
        <p>Create Batch</p>
      </Button>
    </div>
  );
}
