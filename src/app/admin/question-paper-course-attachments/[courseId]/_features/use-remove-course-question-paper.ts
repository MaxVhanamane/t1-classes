"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import type {
    QuestionPaper,
} from "@/src/app/admin/question-papers/_features/types/question-paper";
import { courseQuestionPaperAttachmentQueryKeys } from "./constants/query-keys";



type CourseQuestionPapersResponse = {
    items: QuestionPaper[];
};

async function removeCourseQuestionPaper(
    courseId: string,
    questionPaperId: string,
) {
    const response =
        await fetch(
            `/api/admin/question-paper-course-attachments/${courseId}/question-papers/${questionPaperId}`,
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

export function useRemoveCourseQuestionPaper(
    courseId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            questionPaperId: string,
        ) =>
            removeCourseQuestionPaper(
                courseId,
                questionPaperId,
            ),

        onMutate: async (
            questionPaperId,
        ) => {
            await queryClient.cancelQueries({
                queryKey:
                    courseQuestionPaperAttachmentQueryKeys.questionPapers(
                        courseId,
                    ),
            });

            const previousData =
                queryClient.getQueryData<CourseQuestionPapersResponse>(
                    courseQuestionPaperAttachmentQueryKeys.questionPapers(
                        courseId,
                    ),
                );

            queryClient.setQueryData<CourseQuestionPapersResponse>(
                courseQuestionPaperAttachmentQueryKeys.questionPapers(
                    courseId,
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
                    courseQuestionPaperAttachmentQueryKeys.questionPapers(
                        courseId,
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
                    courseQuestionPaperAttachmentQueryKeys.questionPapers(
                        courseId,
                    ),
            });

            void queryClient.invalidateQueries({
                queryKey: [
                    "course-question-paper-attachment",
                    "available-question-papers",
                    courseId,
                ],
            });
        },
    });
}
