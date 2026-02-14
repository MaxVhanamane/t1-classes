export type AttemptState = {
    questionId: string
    answer: unknown
    visited: boolean
    markedForReview: boolean
}

export type AttemptSection = {
    id: string
    title: string
    subjectLabel: string
    description: string | null
    answerMode: "single_select" | "multi_select" | "numerical_input" | "match_matrix"
    fullMarks: number
    negativeMarks: number
    maxSelections: number | null
    scoringQuestionCount: number | null
    questions: {
        id: string
        questionText: string
        options: {
            id: string
            label: string
            text: string
        }[]
    }[]
}

export type AttemptResponse =
    | {
        kind: "denied"
        reason:
        | "not_found"
        | "not_owner"
        | "not_enrolled"
        | "expired"
        | "submitted"
        | "ended"
    }
    | {
        kind: "ok"
        attemptId: string
        testId: string
        distributionId: string
        startedAt: string
        expiresAt: string
        timeLimitSeconds: number
        remainingSeconds: number
        test: {
            title: string
            sections: AttemptSection[]
        }
        state: AttemptState[]
    }
