"use client";

import { useQuery } from "@tanstack/react-query";



import {
    QuestionPaperFilters,
    QuestionPaperListResponse,
} from "../types/question-paper";
import { questionPaperQueryKeys } from "../constants/query-keys";

async function fetchQuestionPapers(
    filters: QuestionPaperFilters,
): Promise<QuestionPaperListResponse> {
    const searchParams =
        new URLSearchParams();

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
        filters.targetExam
    ) {
        searchParams.set(
            "targetExam",
            filters.targetExam,
        );
    }

    if (
        filters.classLevel !==
        null
    ) {
        searchParams.set(
            "classLevel",
            String(
                filters.classLevel,
            ),
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

    const response =
        await fetch(
            `/api/admin/question-papers?${searchParams.toString()}`,
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
            "Failed to load question papers",
        );
    }

    return response.json();
}

export function useQuestionPapers(
    filters: QuestionPaperFilters,
) {
    return useQuery({
        queryKey:
            questionPaperQueryKeys.list(
                filters,
            ),

        queryFn: () =>
            fetchQuestionPapers(
                filters,
            ),

        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,

        placeholderData: (
            previousData,
        ) => previousData,
    });
}
