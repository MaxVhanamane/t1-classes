"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import type { TestQuestion } from "../types/question.types";

export function useQuestions(sectionId: string) {
    return useQuery<TestQuestion[]>({
        queryKey: ["section-questions", sectionId],

        queryFn: () =>
            fetchWrapper<TestQuestion[]>(
                `/api/admin/section/questions?sectionId=${sectionId}`
            ),

        enabled: !!sectionId,
    });
}
