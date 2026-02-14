"use client";

import { useQuery } from "@tanstack/react-query";
import type {
    QuestionsPageResponse,
} from "@/src/app/api/tests/results/[attemptId]/sections/[sectionId]/questions/route";

type Params = {
    attemptId: string;
    sectionId: string;
    page: number;
};

async function fetchSectionQuestions({
    attemptId,
    sectionId,
    page,
}: Params): Promise<QuestionsPageResponse> {
    const res = await fetch(
        `/api/tests/results/${attemptId}/sections/${sectionId}/questions?page=${page}&limit=10`,
        { credentials: "include" }
    );

    if (!res.ok) {
        throw new Error("Failed to load questions");
    }

    return res.json();
}


export function useSectionQuestions(
    attemptId: string,
    sectionId: string,
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
                sectionId,
                page,
            }),
        staleTime: Infinity,
    });
}
