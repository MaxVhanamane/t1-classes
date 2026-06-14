"use client";

import { useQuery } from "@tanstack/react-query";

import type {
    DistributionFilters,
} from "../types/distribution-filters";

import type {
    PagedDistributions,
} from "../types/distribution.types";

async function fetchDistributions(
    filters: DistributionFilters,
): Promise<PagedDistributions> {
    const searchParams =
        new URLSearchParams();

    if (filters.search) {
        searchParams.set(
            "search",
            filters.search,
        );
    }

    if (filters.createdBy) {
        searchParams.set(
            "createdBy",
            filters.createdBy,
        );
    }

    searchParams.set(
        "status",
        filters.status,
    );

    searchParams.set(
        "page",
        String(filters.page),
    );

    const response =
        await fetch(
            `/api/admin/test-distributions?${searchParams.toString()}`,
            {
                credentials:
                    "include",
            },
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load distributions",
        );
    }

    return data;
}

export function useDistributions(
    filters: DistributionFilters,
) {
    return useQuery({
        queryKey: [
            "admin",
            "test-distributions",
            filters,
        ],

        queryFn: () =>
            fetchDistributions(
                filters,
            ),

        placeholderData:
            filters.page > 1
                ? (previousData) =>
                    previousData
                : undefined,

        staleTime:
            1000 * 60,

        gcTime:
            1000 * 60 * 30,
    });
}
