"use client";

import { useQuery } from "@tanstack/react-query";

export function useBatchStudents({
    batchId,
    enabled,
}: {
    batchId?: string;

    enabled: boolean;
}) {
    return useQuery({
        queryKey: [
            "batch-students",
            batchId,
        ],

        enabled:
            enabled && !!batchId,

        queryFn: async () => {
            const response = await fetch(
                `/api/admin/mentorship-sessions/batches/${batchId}/students`,
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch students",
                );
            }

            return response.json();
        },

        staleTime:
            1000 * 60 * 5,
    });
}
