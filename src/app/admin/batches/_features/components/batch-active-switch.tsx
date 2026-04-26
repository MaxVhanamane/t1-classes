"use client";

import { useState } from "react";

import { toast } from "sonner";
import { toggleBatchActive } from "../actions/toggle-batch-active";
import { Switch } from "@/src/components/ui/switch";
import { callServerAction } from "@/src/lib/actions/call-server-action";

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

        const { error } = await callServerAction(
          toggleBatchActive(batchId, next),
        );

        if (error) {
          setChecked(prev);
          toast.error(error);
          setLoading(false);
          return;
        }

        toast.success(next ? "Batch activated" : "Batch deactivated");
        setLoading(false);
      }}
    />
  );
}
