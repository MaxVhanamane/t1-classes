"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import type {
    QuestionsPageResponse,
} from "@/src/app/api/tests/results/[attemptId]/sections/[sectionId]/questions/route";

type Params = {
    attemptId: string;
    sectionId: string;
    page: number;
};

function fetchSectionQuestions({
    attemptId,
    sectionId,
    page,
}: Params): Promise<QuestionsPageResponse> {
    return fetchWrapper<QuestionsPageResponse>(
        `/api/tests/results/${attemptId}/sections/${sectionId}/questions?page=${page}&limit=10`
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
