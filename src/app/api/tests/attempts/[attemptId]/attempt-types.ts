export type AnswerMode =
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix"

export type QuestionOption = {
    id: string
    label: string
    text: string
}

export type Question = {
    id: string
    questionText: string
    options: QuestionOption[]
}

export type Section = {
    id: string
    title: string
    subjectLabel: string
    description: string | null
    answerMode: AnswerMode
    fullMarks: number
    negativeMarks: number
    maxSelections: number | null
    scoringQuestionCount: number | null
    questions: Question[]
}

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
        test: {
            title: string
            sections: Section[]
        }
        state: {
            questionId: string
            answer: unknown | null
            visited: boolean
            markedForReview: boolean
        }[]
    }
