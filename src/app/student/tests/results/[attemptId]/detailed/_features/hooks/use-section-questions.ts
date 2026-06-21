"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { QuestionsPageResponse } from "../types/question-details.types";

type Params = {
    attemptId: string;
    sectionId: string;
    page: number;
};

export const LIMIT = 25;

function fetchSectionQuestions({
    attemptId,
    sectionId,
    page,
}: Params): Promise<QuestionsPageResponse> {
    return fetchWrapper<QuestionsPageResponse>(
        `/api/tests/results/${attemptId}/sections/${sectionId}/questions?page=${page}&limit=${LIMIT}`
    );
}

export function useSectionQuestions(
    attemptId: string,
    sectionId: string | null | undefined,
    page: number
) {
    return useQuery({
        queryKey: [
            "section-questions",
            attemptId,
            sectionId,
            page,
        ],

        queryFn: () =>
            fetchSectionQuestions({
                attemptId,
                sectionId: sectionId!,
                page,
            }),

        enabled:
            !!attemptId &&
            !!sectionId,

        staleTime: Infinity,
    });
}
