"use client";

import { useQuery } from "@tanstack/react-query";
import { SyllabusProgressResponse } from "../types/syllabus-progress.types";



async function fetchSyllabusProgress(
    batchId: string
): Promise<SyllabusProgressResponse> {
    const response = await fetch(
        `/api/admin/syllabus-progress?batchId=${encodeURIComponent(batchId)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? "Failed to load syllabus progress");
    }

    return data;
}

export function useSyllabusProgress(batchId: string | null) {
    return useQuery({
        queryKey: ["syllabus-progress", batchId],

        queryFn: () => fetchSyllabusProgress(batchId!),

        // Only run the query when a batchId is actually selected
        enabled: Boolean(batchId),

        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,   // 30 minutes
    });
}
