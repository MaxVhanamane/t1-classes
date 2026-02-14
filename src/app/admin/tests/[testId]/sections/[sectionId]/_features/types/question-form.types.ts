export type QuestionOptionForm = {
    id: string
    text: string
}

export type CreateQuestionFormValues = {
    questionText: string
    explanation?: string
    options: QuestionOptionForm[]
    correctAnswer: string | null
}

export type OptionDraft = {
    id: string // temp UUID
    text: string
}
