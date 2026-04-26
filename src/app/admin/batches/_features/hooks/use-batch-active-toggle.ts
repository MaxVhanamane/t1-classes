"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleBatchActive } from "../actions/toggle-batch-active";
import { callServerAction } from "@/src/lib/actions/call-server-action";

export function useBatchActiveToggle() {
    const [isPending, startTransition] = useTransition();

    function toggle(
        batchId: string,
        nextValue: boolean,
        onRevert: () => void
    ) {
        startTransition(async () => {
            const { error } = await callServerAction(
                toggleBatchActive(batchId, nextValue)
            );

            if (error) {
                onRevert();
                toast.error(error);
                return;
            }

            toast.success(
                nextValue ? "Batch activated" : "Batch deactivated"
            );
        });
    }

    return { toggle, isPending };
}
