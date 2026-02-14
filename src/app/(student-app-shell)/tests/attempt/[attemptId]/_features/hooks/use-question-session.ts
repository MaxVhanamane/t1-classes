"use client";

import { useEffect } from "react";
import { StateItem } from "../types/workspace.types";
import { useQuestionNavigator } from "./use-question-navigator";
import { useQuestionVisit } from "./use-question-visit";
import { useAnswerSave } from "./use-answer-save";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { normalizeStudentAnswer } from "../helpers/normalize-student-answer";
import { useAttemptState } from "./use-attempt-state";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useQuestionSession({
    attemptId,
    sections,
    state: initialState,
    activeQuestionId,
    onNavigate,
}: {
    attemptId: string;
    sections: Section[];
    state: StateItem[]; // server seed
    activeQuestionId: string;
    onNavigate: (id: string) => void;
}) {
    // =========================================
    // LIVE STATE (CACHE SOURCE OF TRUTH)
    // =========================================
    const { state: liveState } = useAttemptState(
        attemptId,
        initialState,
    );

    // =========================================
    // NAVIGATION
    // =========================================
    const nav = useQuestionNavigator({
        sections,
        state: liveState,
        activeQuestionId,
        onNavigate,
    });

    // =========================================
    // VISIT TRACKING
    // =========================================
    useQuestionVisit({
        attemptId,
        questionId: nav.current?.id,
    });

    // =========================================
    // SAVE LAYER
    // =========================================
    const save = useAnswerSave({ attemptId });

    // =========================================
    // SUBMIT LAYER
    // =========================================
    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `/api/tests/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                    credentials: "include",
                },
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Submit failed");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Test submitted successfully");
            window.location.href = `/tests/results/${attemptId}`;
        },
        onError: () => {
            toast.error("Submit failed — please try again");
        },
    });

    // =========================================
    // AUTOSUBMIT LISTENER
    // =========================================
    useEffect(() => {
        const handler = () => {
            toast.warning("Time’s up — auto submitting test");
            submitMutation.mutate();
        };

        window.addEventListener("exam-autosubmit", handler);
        return () => {
            window.removeEventListener("exam-autosubmit", handler);
        };
    }, [submitMutation]);

    // =========================================
    // COMMANDS
    // =========================================
    function clearAnswer() {
        if (!nav.current) return;

        save.mutate({
            questionId: nav.current.id,
            answer: null,
            markedForReview: false,
        });
    }

    function saveAnswer(draft: unknown | null) {
        if (!nav.current) return;

        const normalized = normalizeStudentAnswer(
            nav.current.section.answerMode,
            draft,
        );

        save.mutate({
            questionId: nav.current.id,
            answer: normalized,
            markedForReview: false,
        });
    }

    function markForReview() {
        if (!nav.current) return;

        save.mutate({
            questionId: nav.current.id,
            answer: null,
            markedForReview: true,
        });
    }

    function saveAnswerAndMarkForReview(draft: unknown | null) {
        if (!nav.current) return;

        const normalized = normalizeStudentAnswer(
            nav.current.section.answerMode,
            draft,
        );

        save.mutate({
            questionId: nav.current.id,
            answer: normalized,
            markedForReview: true,
        });
    }

    // =========================================
    // UX COMPOSITES
    // =========================================
    function saveAnswerAndNext(answer: unknown | null) {
        saveAnswer(answer);
        nav.goNext();
    }

    function markForReviewAndNext() {
        markForReview();
        nav.goNext();
    }

    function submitTest() {
        toast.warning("Submitting test…");
        submitMutation.mutate();
    }

    // =========================================
    // RETURN
    // =========================================
    return {
        ...nav,

        // Commands
        clearAnswer,
        saveAnswer,
        saveAnswerAndNext,
        markForReview,
        markForReviewAndNext,
        saveAnswerAndMarkForReview,
        submitTest,
    };
}
