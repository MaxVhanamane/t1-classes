"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import type {
    QuestionPaper,
} from "@/src/app/admin/question-papers/_features/types/question-paper";

import {
    batchQuestionPaperAttachmentQueryKeys,
} from "../constants/query-keys";

type Response = {
    items: QuestionPaper[];
};

async function fetchBatchQuestionPapers(
    batchId: string,
): Promise<Response> {
    const response =
        await fetch(
            `/api/admin/question-paper-batch-attachments/${batchId}/question-papers`,
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
            "Failed to load attached question papers",
        );
    }

    return response.json();
}

export function useBatchQuestionPapers(
    batchId: string,
) {
    return useQuery({
        queryKey:
            batchQuestionPaperAttachmentQueryKeys.questionPapers(
                batchId,
            ),

        queryFn: () =>
            fetchBatchQuestionPapers(
                batchId,
            ),

        enabled:
            Boolean(
                batchId,
            ),

        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,
    });
}
