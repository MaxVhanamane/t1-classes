"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { batchQuestionPaperAttachmentQueryKeys } from "../constants/query-keys";

type Variables = {
    questionPaperIds: string[];
};

async function attachBatchQuestionPapers(
    batchId: string,
    variables: Variables,
) {
    const response = await fetch(
        `/api/admin/question-paper-batch-attachments/${batchId}/attach-question-papers`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(
                variables,
            ),
        },
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to attach question papers.",
        );
    }

    return data;
}

export function useAttachBatchQuestionPapers(
    batchId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            variables: Variables,
        ) =>
            attachBatchQuestionPapers(
                batchId,
                variables,
            ),

        onSuccess: () => {
            void queryClient.invalidateQueries(
                {
                    queryKey:
                        batchQuestionPaperAttachmentQueryKeys.questionPapers(
                            batchId,
                        ),
                },
            );

            void queryClient.invalidateQueries(
                {
                    queryKey: [
                        "batch-question-paper-attachment",
                        "available-question-papers",
                        batchId,
                    ],
                },
            );
        },
    });
}
