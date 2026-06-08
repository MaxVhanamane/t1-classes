"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import type {
    QuestionPaper,
} from "@/src/app/admin/question-papers/_features/types/question-paper";

import {
    batchQuestionPaperAttachmentQueryKeys,
} from "../constants/query-keys";

type BatchQuestionPapersResponse = {
    items: QuestionPaper[];
};

async function removeBatchQuestionPaper(
    batchId: string,
    questionPaperId: string,
) {
    const response =
        await fetch(
            `/api/admin/question-paper-batch-attachments/${batchId}/question-papers/${questionPaperId}`,
            {
                method: "DELETE",

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
            "Failed to remove question paper",
        );
    }
}

export function useRemoveBatchQuestionPaper(
    batchId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            questionPaperId: string,
        ) =>
            removeBatchQuestionPaper(
                batchId,
                questionPaperId,
            ),

        onMutate: async (
            questionPaperId,
        ) => {
            await queryClient.cancelQueries({
                queryKey:
                    batchQuestionPaperAttachmentQueryKeys.questionPapers(
                        batchId,
                    ),
            });

            const previousData =
                queryClient.getQueryData<BatchQuestionPapersResponse>(
                    batchQuestionPaperAttachmentQueryKeys.questionPapers(
                        batchId,
                    ),
                );

            queryClient.setQueryData<BatchQuestionPapersResponse>(
                batchQuestionPaperAttachmentQueryKeys.questionPapers(
                    batchId,
                ),
                (old) => {
                    if (
                        !old
                    ) {
                        return old;
                    }

                    return {
                        ...old,

                        items:
                            old.items.filter(
                                (
                                    paper,
                                ) =>
                                    paper.id !==
                                    questionPaperId,
                            ),
                    };
                },
            );

            return {
                previousData,
            };
        },

        onError: (
            error,
            _questionPaperId,
            context,
        ) => {
            if (
                context?.previousData
            ) {
                queryClient.setQueryData(
                    batchQuestionPaperAttachmentQueryKeys.questionPapers(
                        batchId,
                    ),
                    context.previousData,
                );
            }

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to remove question paper",
            );
        },


        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey:
                    batchQuestionPaperAttachmentQueryKeys.questionPapers(
                        batchId,
                    ),
            });

            void queryClient.invalidateQueries({
                queryKey: [
                    "batch-question-paper-attachment",
                    "available-question-papers",
                    batchId,
                ],
            });
        },
    });
}
