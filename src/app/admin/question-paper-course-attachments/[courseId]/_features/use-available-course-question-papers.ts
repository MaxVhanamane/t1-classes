
"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import type {
    QuestionPaperFilters,
    QuestionPaperListResponse,
} from "@/src/app/admin/question-papers/_features/types/question-paper";
import { courseQuestionPaperAttachmentQueryKeys } from "./constants/query-keys";



async function fetchAvailableCourseQuestionPapers(
    courseId: string,
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
            `/api/admin/question-paper-course-attachments/${courseId}/available-question-papers?${searchParams.toString()}`,
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

export function useAvailableCourseQuestionPapers(
    courseId: string,
    filters: QuestionPaperFilters,
) {
    return useQuery({
        queryKey:
            courseQuestionPaperAttachmentQueryKeys.availableQuestionPapers(
                courseId,
                filters,
            ),

        queryFn: () =>
            fetchAvailableCourseQuestionPapers(
                courseId,
                filters,
            ),

        enabled:
            Boolean(
                courseId,
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
