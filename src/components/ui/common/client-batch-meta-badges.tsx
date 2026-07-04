"use client";

import { useEffect, useState } from "react";
import {
  BatchLifecycle,
  getBatchLifecycle,
} from "@/src/lib/helper-functions/get-batch-lifecycle";
import { BatchMetaBadges } from "./batch-meta-badges";
import { BatchMode } from "@/src/app/admin/batches/_features/types/types";

interface ClientBatchMetaBadgesProps {
  batch: {
    mode: BatchMode;
    start_date: string;
    end_date: string;
    is_active: boolean;
  };
  size?: "sm" | "md";
}

export function ClientBatchMetaBadges({
  batch,
  size,
}: ClientBatchMetaBadgesProps) {
  const [lifecycle, setLifecycle] = useState<BatchLifecycle | null>(null);

  useEffect(() => {
    setLifecycle(getBatchLifecycle(batch));
  }, [batch]);

  return <BatchMetaBadges batch={batch} lifecycle={lifecycle} size={size} />;
}
