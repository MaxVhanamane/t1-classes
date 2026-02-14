"use client";

import { useQuery } from "@tanstack/react-query";
import { MyRankResponse } from "../types/my-rank";

export function useMyRank(
    distributionId: string,
    enabled: boolean
) {
    return useQuery<MyRankResponse>({
        queryKey: ["my-rank", distributionId],

        queryFn: async () => {
            const res = await fetch(
                `/api/tests/distributions/${distributionId}/rank`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch rank");
            }

            return res.json();
        },

        enabled, // Prevent unnecessary calls
        staleTime: Infinity,
    });
}
