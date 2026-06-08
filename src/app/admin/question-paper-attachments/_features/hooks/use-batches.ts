"use client";

import { useQuery } from "@tanstack/react-query";


import { AttachmentTargetsResponse } from "../types/attachment-target";
import { questionPaperAttachmentQueryKeys } from "../constants/query-keys";
import { AttachmentFiltersType } from "../types/attachment-filters";



async function fetchBatches(
    filters: AttachmentFiltersType,
): Promise<AttachmentTargetsResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set(
        "page",
        String(filters.page),
    );

    searchParams.set(
        "pageSize",
        String(filters.pageSize),
    );

    if (
        filters.search.trim()
    ) {
        searchParams.set(
            "search",
            filters.search.trim(),
        );
    }

    if (
        filters.classLevel
    ) {
        searchParams.set(
            "classLevel",
            String(
                filters.classLevel,
            ),
        );
    }

    if (
        filters.targetExam
    ) {
        searchParams.set(
            "targetExam",
            filters.targetExam,
        );
    }

    const response =
        await fetch(
            `/api/admin/question-paper-attachments/batches?${searchParams.toString()}`,
            {
                credentials:
                    "include",
            },
        );

    if (
        !response.ok
    ) {
        const error =
            await response
                .json()
                .catch(
                    () => null,
                );

        throw new Error(
            error?.message ??
            "Failed to load batches",
        );
    }

    return response.json();
}

export function useBatches(
    filters: AttachmentFiltersType,
    enabled = true,
) {
    return useQuery({
        queryKey:
            questionPaperAttachmentQueryKeys.batchList(
                filters,
            ),

        queryFn: () =>
            fetchBatches(
                filters,
            ),
        enabled,
        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,

        placeholderData: (
            previousData,
        ) => previousData,
    });
}
