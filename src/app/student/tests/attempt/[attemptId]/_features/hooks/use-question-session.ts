"use client";

import { StateItem } from "../types/workspace.types";
import { useQuestionNavigator } from "./use-question-navigator";
import { useAnswerSave } from "./use-answer-save";
import { Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { normalizeStudentAnswer } from "../helpers/normalize-student-answer";
import { useAttemptState } from "./use-attempt-state";
import { QuestionTimer } from "./use-question-time-tracker";

export function useQuestionSession({
    attemptId,
    sections,
    state: initialState,
    activeQuestionId,
    onNavigate,
    timer
}: {
    attemptId: string;
    sections: Section[];
    state: StateItem[]; // server seed
    activeQuestionId: string;
    onNavigate: (id: string) => void;
    timer: QuestionTimer
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
    // SAVE LAYER
    // =========================================
    const save = useAnswerSave({ attemptId, timer });


    // =========================================
    // COMMANDS
    // =========================================
    function clearAnswer() {
        if (!nav.current) return;
        timer.flushCurrentQuestion();

        const timeSpentSeconds =
            timer.getQuestionTime(
                nav.current.id,
            );
        save.mutate({
            questionId: nav.current.id,
            answer: null,
            markedForReview: false,
            timeSpentSeconds
        });
    }

    function saveAnswer(draft: unknown | null) {
        if (!nav.current) return;

        const normalized = normalizeStudentAnswer(
            nav.current.section.answerMode,
            draft,
        );
        timer.flushCurrentQuestion();

        const timeSpentSeconds =
            timer.getQuestionTime(
                nav.current.id,
            );
        save.mutate({
            questionId: nav.current.id,
            answer: normalized,
            markedForReview: false,
            timeSpentSeconds
        });
    }

    function markForReview() {
        if (!nav.current) return;
        timer.flushCurrentQuestion();

        const timeSpentSeconds =
            timer.getQuestionTime(
                nav.current.id,
            );
        save.mutate({
            questionId: nav.current.id,
            answer: null,
            markedForReview: true,
            timeSpentSeconds
        });
    }

    function saveAnswerAndMarkForReview(draft: unknown | null) {
        if (!nav.current) return;

        const normalized = normalizeStudentAnswer(
            nav.current.section.answerMode,
            draft,
        );
        timer.flushCurrentQuestion();

        const timeSpentSeconds =
            timer.getQuestionTime(
                nav.current.id,
            );
        save.mutate({
            questionId: nav.current.id,
            answer: normalized,
            markedForReview: true,
            timeSpentSeconds
        });
        nav.goNext();
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

    };
}
