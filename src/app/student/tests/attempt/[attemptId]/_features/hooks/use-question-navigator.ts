"use client";

import { useMemo } from "react";
import { StateItem } from "../types/workspace.types";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

export function useQuestionNavigator({
    sections,
    state,
    activeQuestionId,
    onNavigate,
}: {
    sections: Section[];
    state: StateItem[]; // MUST be live cache state
    activeQuestionId: string;
    onNavigate: (id: string) => void;
}) {
    // =========================================
    // FLATTEN QUESTIONS
    // =========================================
    const flat = useMemo(() => {
        return sections.flatMap((s) =>
            s.questions.map((q) => ({
                ...q,
                section: s,
            })),
        );
    }, [sections]);

    const index = flat.findIndex((q) => q.id === activeQuestionId);
    const current = flat[index];

    // =========================================
    // STATE MAP (LIVE CACHE)
    // =========================================
    const stateMap = useMemo(() => {
        return new Map(state.map((s) => [s.questionId, s]));
    }, [state]);

    const answerState = current
        ? stateMap.get(current.id)
        : undefined;

    // =========================================
    // NAVIGATION
    // =========================================
    function goNext() {
        if (index < flat.length - 1) {
            onNavigate(flat[index + 1].id);
        }
    }

    function goBack() {
        if (index > 0) {
            onNavigate(flat[index - 1].id);
        }
    }

    return {
        flat,
        index,
        current,
        answerState,
        isFirst: index === 0,
        isLast: index === flat.length - 1,
        goNext,
        goBack,
    };
}
