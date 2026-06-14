"use client";

import { useQuery } from "@tanstack/react-query";

import type { BatchOption } from "@/src/app/admin/enrollments/_features/types/enrollments.types";

async function fetchEnrollmentBatchOptions(): Promise<
    BatchOption[]
> {
    const response = await fetch(
        "/api/admin/enrollments/options/batches",
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load batches",
        );
    }

    return data;
}

export function useEnrollmentBatchOptions() {
    return useQuery({
        queryKey: [
            "enrollment-batch-options",
        ],

        queryFn:
            fetchEnrollmentBatchOptions,

        staleTime:
            1000 * 60 * 30,

        gcTime:
            1000 * 60 * 60,
    });
}
