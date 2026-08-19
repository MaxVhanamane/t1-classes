"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentsForMarking } from "../../../actions/marking/fetch-students-for-marking";

export function useStudentsForMarking(batchId: string, assignmentId: string | null) {
    return useQuery({
        queryKey: ["admin", "marking-students", batchId, assignmentId],
        queryFn: () => {
            if (!assignmentId) return [];
            return fetchStudentsForMarking(batchId, assignmentId);
        },
        enabled: !!assignmentId && !!batchId,
        staleTime: 0, // Always fetch fresh data when opening the marking sheet
    });
}
