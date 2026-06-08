"use client";

import { useQuery } from "@tanstack/react-query";

type BatchDetails = {
    id: string;

    title: string;

    class_level: number | null;

    target_exam: string | null;
};

async function fetchBatchDetails(
    batchId: string,
): Promise<BatchDetails> {
    const response =
        await fetch(
            `/api/admin/question-paper-batch-attachments/${batchId}`,
            {
                credentials:
                    "include",
            },
        );

    if (
        !response.ok
    ) {
        const error =
            await response
                .json()
                .catch(
                    () => null,
                );

        throw new Error(
            error?.message ??
            "Failed to load batch details",
        );
    }

    return response.json();
}

export function useBatchDetails(
    batchId: string,
) {
    return useQuery({
        queryKey: [
            "batch-details",
            batchId,
        ],

        queryFn: () =>
            fetchBatchDetails(
                batchId,
            ),

        enabled:
            Boolean(batchId),

        staleTime:
            1000 * 60 * 10,

        gcTime:
            1000 * 60 * 30,
    });
}
