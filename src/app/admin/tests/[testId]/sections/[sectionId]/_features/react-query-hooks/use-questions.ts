"use client";

import { useQuery } from "@tanstack/react-query";
import type { TestQuestion } from "../types/question.types";

export function useQuestions(sectionId: string) {
    return useQuery<TestQuestion[]>({
        queryKey: ["section-questions", sectionId],

        queryFn: async () => {
            const res = await fetch(`/api/admin/section/questions?sectionId=${sectionId}`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch questions");
            }

            return res.json();
        },

        enabled: !!sectionId,
    });
}
