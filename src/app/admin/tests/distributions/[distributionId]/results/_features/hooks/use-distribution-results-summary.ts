"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { DistributionResultsSummary } from "../types/results.types";

export function useDistributionResultsSummary(
    distributionId: string,
) {
    return useQuery<DistributionResultsSummary>({
        queryKey: [
            "admin",
            "distribution-results-summary",
            distributionId,
        ],

        queryFn: () =>
            fetchWrapper<DistributionResultsSummary>(
                `/api/admin/distributions/${distributionId}/results/summary`,
            ),

        enabled: Boolean(distributionId),
    });
}
