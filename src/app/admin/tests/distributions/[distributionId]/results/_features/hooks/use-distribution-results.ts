"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import {
    PagedResults,
    ResultsQueryParams,
} from "../types/results.types";

export function useDistributionResults({
    distributionId,
    page,
    pageSize = 25,
    search,
    sort = "rank",
}: ResultsQueryParams) {
    return useQuery<PagedResults>({
        queryKey: [
            "admin",
            "distribution-results",
            distributionId,
            page,
            pageSize,
            search,
            sort,
        ],

        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                sort,
            });

            if (search?.trim()) {
                params.set("search", search.trim());
            }

            return fetchWrapper<PagedResults>(
                `/api/admin/distributions/${distributionId}/results?${params.toString()}`,
            );
        },

        placeholderData: (previousData) => previousData,

        enabled: Boolean(distributionId),
    });
}
