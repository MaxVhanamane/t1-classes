"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { MyRankResponse } from "../types/my-rank";

export function useMyRank(
    distributionId: string,
    enabled: boolean
) {
    return useQuery<MyRankResponse>({
        queryKey: ["my-rank", distributionId],

        queryFn: () =>
            fetchWrapper<MyRankResponse>(
                `/api/tests/distributions/${distributionId}/rank`
            ),

        enabled,
        staleTime: Infinity,
    });
}
