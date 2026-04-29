"use client";

import { useQuery } from "@tanstack/react-query";
import { BatchRow } from "../types/batch.types";

async function fetchBatches(): Promise<BatchRow[]> {
    const res = await fetch("/api/admin/schedule/batches");

    if (!res.ok) {
        throw new Error("Failed to fetch batches");
    }

    return res.json();
}

export function useBatches() {
    return useQuery({
        queryKey: ["batches"],
        queryFn: fetchBatches,
        staleTime: 1000 * 60 * 10,
    });
}
