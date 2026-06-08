
"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import type {
    QuestionPaperFilters,
    QuestionPaperListResponse,
} from "@/src/app/admin/question-papers/_features/types/question-paper";

import {
    batchQuestionPaperAttachmentQueryKeys,
} from "../constants/query-keys";

async function fetchAvailableBatchQuestionPapers(
    batchId: string,
    filters: QuestionPaperFilters,
): Promise<QuestionPaperListResponse> {
    const searchParams =
        new URLSearchParams();

    if (
        filters.search
    ) {
        searchParams.set(
            "search",
            filters.search,
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

    if (
        filters.subject
    ) {
        searchParams.set(
            "subject",
            filters.subject,
        );
    }

    if (
        filters.category
    ) {
        searchParams.set(
            "category",
            filters.category,
        );
    }

    searchParams.set(
        "page",
        String(
            filters.page,
        ),
    );

    searchParams.set(
        "pageSize",
        String(
            filters.pageSize,
        ),
    );

    const response =
        await fetch(
            `/api/admin/question-paper-batch-attachments/${batchId}/available-question-papers?${searchParams.toString()}`,
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
            "Failed to load available question papers",
        );
    }

    return response.json();
}

export function useAvailableBatchQuestionPapers(
    batchId: string,
    filters: QuestionPaperFilters,
) {
    return useQuery({
        queryKey:
            batchQuestionPaperAttachmentQueryKeys.availableQuestionPapers(
                batchId,
                filters,
            ),

        queryFn: () =>
            fetchAvailableBatchQuestionPapers(
                batchId,
                filters,
            ),

        enabled:
            Boolean(
                batchId,
            ),

        placeholderData:
            (
                previousData,
            ) =>
                previousData,

        staleTime:
            1000 * 60,
    });
}
