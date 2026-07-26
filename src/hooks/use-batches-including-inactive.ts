"use client";

import { useQuery } from "@tanstack/react-query";

export type BatchOptionWithStatusItem = {
    id: string;
    title: string;
    is_active: boolean;
};

async function fetchBatchesIncludingInactive(): Promise<BatchOptionWithStatusItem[]> {
    const response = await fetch(
        "/api/admin/options/batches?includeInactive=true"
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? "Failed to load batches including inactive");
    }

    return data;
}

export function useBatchesIncludingInactive() {
    return useQuery({
        queryKey: ["batches-including-inactive"],

        queryFn: fetchBatchesIncludingInactive,

        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60,
    });
}
