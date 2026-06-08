"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import type {
    QuestionPaper,
} from "@/src/app/admin/question-papers/_features/types/question-paper";
import { courseQuestionPaperAttachmentQueryKeys } from "./constants/query-keys";


type Response = {
    items: QuestionPaper[];
};

async function fetchCourseQuestionPapers(
    courseId: string,
): Promise<Response> {
    const response =
        await fetch(
            `/api/admin/question-paper-course-attachments/${courseId}/question-papers`,
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

export function useCourseQuestionPapers(
    courseId: string,
) {
    return useQuery({
        queryKey:
            courseQuestionPaperAttachmentQueryKeys.questionPapers(
                courseId,
            ),

        queryFn: () =>
            fetchCourseQuestionPapers(
                courseId,
            ),

        enabled:
            Boolean(
                courseId,
            ),

        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,
    });
}
