"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBatchAssignments } from "../../actions/fetch-batch-assignments";
import type { BatchAssignmentFilters } from "../types/batch-assignments.types";

export function useBatchAssignments(batchId: string, filters: BatchAssignmentFilters) {
    return useQuery({
        queryKey: ["admin", "batch-assignments", batchId, filters],
        queryFn: () => fetchBatchAssignments(batchId, filters),
        placeholderData: filters.page > 1 ? (prev) => prev : undefined,
        refetchOnMount: "always",
        staleTime: 1000 * 60,
    });
}
