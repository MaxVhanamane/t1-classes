"use client";

import { useQuery } from "@tanstack/react-query";

export type ActiveBatchSelectItem = {
    id: string;
    title: string;
};

async function fetchActiveBatchOptions(): Promise<ActiveBatchSelectItem[]> {
    const response = await fetch("/api/admin/options/batches?includeInactive=false");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? "Failed to load active batches");
    }

    return data;
}

export function useActiveBatchOptions() {
    return useQuery({
        queryKey: ["active-batch-options"],
        queryFn: fetchActiveBatchOptions,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });
}
