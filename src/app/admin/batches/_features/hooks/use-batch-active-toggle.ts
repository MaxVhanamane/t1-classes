"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleBatchActive } from "../actions/toggle-batch-active";

export function useBatchActiveToggle() {
    const [isPending, startTransition] = useTransition();

    function toggle(
        batchId: string,
        nextValue: boolean,
        onRevert: () => void
    ) {
        startTransition(async () => {
            try {
                await toggleBatchActive(batchId, nextValue);
                toast.success(
                    nextValue ? "Batch activated" : "Batch deactivated"
                );
            } catch (e) {
                onRevert();

                const message =
                    e instanceof Error
                        ? e.message
                        : "Failed to update batch";

                toast.error(message);
            }
        });
    }

    return { toggle, isPending };
}
