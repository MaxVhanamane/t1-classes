"use client";

import { useState } from "react";

import { toast } from "sonner";
import { toggleBatchActive } from "../actions/toggle-batch-active";
import { Switch } from "@/src/components/ui/switch";

type Props = {
  batchId: string;
  initialValue: boolean;
};

export function BatchActiveSwitch({ batchId, initialValue }: Props) {
  const [checked, setChecked] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  return (
    <Switch
      className="cursor-pointer"
      checked={checked}
      disabled={loading}
      onCheckedChange={async (next) => {
        const prev = checked;
        setChecked(next);
        setLoading(true);

        try {
          await toggleBatchActive(batchId, next);
          toast.success(next ? "Batch activated" : "Batch deactivated");
        } catch (e) {
          setChecked(prev);

          const message =
            e instanceof Error ? e.message : "Failed to update batch";

          toast.error(message);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
