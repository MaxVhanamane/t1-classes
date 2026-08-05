import { JSONContent } from "@tiptap/react";
import { PerformanceLabelType } from "@/src/app/api/tests/results/[attemptId]/summary/route";

/* =========================================================
   SECTIONS
========================================================= */

export type PartialMarkingByCorrectCount = {
    type: "by_correct_count";
    rules: {
        marks: number;
        minCorrect: number;
    }[];
};

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

    questionCount: number;

    totalTimeSpentSeconds?: number;
};

/* =========================================================
   SUMMARY
========================================================= */
export type ResultSummary =
    | {
        kind: "ok";

        attemptId: string;
        testId: string;
        distributionId: string;

        distributionEndsAt: string;
        rankingAvailableAt: string;

        obtainedMarks: number;
        totalMarks: number;

        percentage: number;

        rank: number | null;
        percentile: number | null;

        performanceLabel: PerformanceLabelType;

        totalParticipants: number | null;

        activeTimeSeconds: number;

        correctCount: number;
        partialCorrectCount: number;
        wrongCount: number;
        unansweredCount: number;

        status:
        | "submitted"
        | "expired"
        | "in_progress";

        submittedAt: string;

        test: {
            title: string;
        };
    }
    | null;

/* =========================================================
   QUESTION REVIEW
========================================================= */

export type OptionReview = {
    id: string;
    label: string;
    text: JSONContent;
    isCorrect: boolean;
    isSelected: boolean;
};

export type NumericalMeta = {
    target: number;
    tolerance: number;
    studentValue: number | null;
};

export type QuestionReview = {
    id: string;
    questionText: JSONContent;
    explanation: JSONContent | null;

    timeSpentSeconds: number;
    marksAwarded: number;
    isCorrect: boolean;

    participantCount: number;
    attemptedCount: number;
    correctCount: number;

    avgMarks: number;
    avgTimeSeconds: number;

    topperMarks: number;
    topperTimeSeconds: number;

    options: OptionReview[];
    isTopper: boolean
    numericalMeta?: NumericalMeta | null;
};

/* =========================================================
   SECTION SUMMARY
========================================================= */

export type SectionReviewSummary = {
    totalQuestions: number;

    attemptedQuestions: number;
    unansweredQuestions: number;

    correctQuestions: number;
    partiallyCorrectQuestions: number;
    wrongQuestions: number;

    totalTimeSpentSeconds: number;

    totalPossibleMarks: number;
    earnedMarks: number;
    lostMarks: number;

    negativePenalty: number;
};
/* =========================================================
   API RESPONSES
========================================================= */

export type QuestionsPageResponse =
    | {
        kind: "ok";

        page: number;
        totalPages: number;

        questions: QuestionReview[];
    }
    | {
        kind: "denied";

        reason:
        | "not_found"
        | "not_owner"
        | "not_enrolled";
    };
