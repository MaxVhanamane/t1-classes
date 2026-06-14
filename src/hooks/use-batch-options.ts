"use client";

import { useQuery } from "@tanstack/react-query";

type BatchSelectItem = {
    id: string;
    title: string;
};

async function fetchBatchOptions(): Promise<
    BatchSelectItem[]
> {
    const response =
        await fetch(
            "/api/admin/options/batches",
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load batches",
        );
    }

    return data;
}

export function useBatchOptions() {
    return useQuery({
        queryKey: [
            "batch-options",
        ],

        queryFn:
            fetchBatchOptions,

        staleTime:
            1000 * 60 * 30,

        gcTime:
            1000 *
            60 *
            60,
    });
}
