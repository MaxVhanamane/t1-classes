"use client";

import { useQuery } from "@tanstack/react-query";

export function useMentorshipBatches(
    open: boolean,
) {
    return useQuery({
        queryKey: [
            "mentorship-batches",
        ],

        enabled: open,

        queryFn: async () => {
            const response = await fetch(
                "/api/admin/mentorship-sessions/batches",
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch batches",
                );
            }

            return response.json();
        },

        staleTime:
            1000 * 60 * 5,
    });
}
