"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import type { PaginatedQuestionsResponse } from "../types/question.types";

export function useQuestions(
    sectionId: string,
    page: number,
) {
    return useQuery<PaginatedQuestionsResponse>({
        queryKey: [
            "admin",
            "tests",
            "sections",
            sectionId,
            "questions",
            page,
        ],

        queryFn: () =>
            fetchWrapper<PaginatedQuestionsResponse>(
                `/api/admin/section/questions?sectionId=${sectionId}&page=${page}`,
            ),

        enabled: !!sectionId,

        placeholderData: (previousData) => previousData,

        staleTime: 1000 * 60 * 5, // 5 minutes

        gcTime: 1000 * 60 * 30, // 30 minutes

        refetchOnWindowFocus: false,

        refetchOnReconnect: false,
    });
}
