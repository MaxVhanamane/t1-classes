"use client";

import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";
import { useQuery } from "@tanstack/react-query";

/* ---------------- Types ---------------- */

export type SectionItem = {
    id: string;
    title: string;
    subjectLabel: string;
    sortOrder: number;
    answerMode:
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";
    fullMarks: number;
    negativeMarks: number;
    partialMarks: PartialMarkingByCorrectCount | null;
    maxSelections: number | null;
    scoringQuestionCount: number | null;
    questionCount: number;
};

export type SectionsResponse =
    | {
        kind: "ok";
        sections: SectionItem[];
    }
    | {
        kind: "denied";
        reason:
        | "not_found"
        | "not_owner"
        | "not_enrolled";
    };

/* ---------------- Fetch ---------------- */

async function fetchSections(
    attemptId: string
): Promise<SectionsResponse> {
    const res = await fetch(
        `/api/tests/results/${attemptId}/sections`,
        { credentials: "include" }
    );

    if (!res.ok) {
        throw new Error("Failed to load sections");
    }

    return res.json();
}

/* ---------------- Hook ---------------- */

export function useSections(attemptId: string) {
    return useQuery({
        queryKey: ["result-sections", attemptId],
        queryFn: () => fetchSections(attemptId),
        staleTime: Infinity,
    });
}
