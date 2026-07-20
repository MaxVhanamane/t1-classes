"use client";

import { useQuery } from "@tanstack/react-query";

import type { LiveClassFilters } from "../types/live-class-filters";
import { liveClassQueryKeys } from "../../constants/query-keys";

export function useLiveClasses(filters: LiveClassFilters) {
    return useQuery({
        queryKey: liveClassQueryKeys.list(filters),

        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(filters.page),
                status: filters.status,
            });

            if (filters.search) {
                params.set("search", filters.search);
            }

            if (filters.batchId) {
                params.set("batchId", filters.batchId);
            }

            if (filters.createdBy) {
                params.set("createdBy", filters.createdBy);
            }

            const response = await fetch(
                `/api/admin/live-classes?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch live classes.");
            }

            return response.json();
        },

        placeholderData: (previousData) => previousData,
    });
}
