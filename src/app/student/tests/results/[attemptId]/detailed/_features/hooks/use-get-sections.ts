"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";

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

function fetchSections(
    attemptId: string
): Promise<SectionsResponse> {
    return fetchWrapper<SectionsResponse>(
        `/api/tests/results/${attemptId}/sections`
    );
}

/* ---------------- Hook ---------------- */

export function useSections(
    attemptId: string
) {
    return useQuery({
        queryKey: [
            "result-sections",
            attemptId,
        ],
        queryFn: () =>
            fetchSections(attemptId),
        staleTime: Infinity,
    });
}
