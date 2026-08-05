import { JSONContent } from "@tiptap/react"

export type AnswerMode =
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix"

export type QuestionOption = {
    id: string
    label: string
    text: JSONContent
}

export type Question = {
    id: string
    questionText: JSONContent
    options: QuestionOption[]
}

export type Section = {
    id: string;
    title: string;
    subjectLabel: string;
    description: string | null;
    answerMode: "single_select" | "multi_select" | "numerical_input" | "match_matrix";
    fullMarks: number;
    negativeMarks: number;
    maxSelections: number | null;
    sectionTotalMarks: number;
    sectionTotalQuestions: number;
    questions: Question[];
};

export type CachedTestPayload = {
    title: string;
    totalMarks: number;
    totalSections: number;
    totalQuestions: number;
    sections: Section[];
};

export type AttemptDeniedReason =
    | "not_found"
    | "not_owner"
    | "not_enrolled"
    | "submitted"
    | "expired"
    | "ended"

export type LoadAttemptResponse =
    | {
        kind: "denied"
        reason: AttemptDeniedReason
    }
    | {
        kind: "ok"
        attemptId: string
        testId: string
        distributionId: string
        startedAt: string
        expiresAt: string
        timeLimitSeconds: number
        test: CachedTestPayload
        state: {
            questionId: string
            answer: unknown | null
            visited: boolean
            markedForReview: boolean
            timeSpentSeconds: number;
        }[]
    };
