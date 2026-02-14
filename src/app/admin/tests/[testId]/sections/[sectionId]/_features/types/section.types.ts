export type TestSection = {
    id: string
    testId: string
    title: string
    subjectLabel: string
    description: string | null
    answerMode: string
    fullMarks: number
    negativeMarks: number
    scoringQuestionCount: number
    partialMarks: Record<string, number> | null
    sortOrder: number
}

