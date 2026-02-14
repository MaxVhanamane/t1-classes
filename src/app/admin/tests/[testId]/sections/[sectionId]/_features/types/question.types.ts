import { CorrectAnswer } from "./correct-answer.types"

export type QuestionOption = {
    id: string
    label: string
    text: string
}


export type TestQuestion = {
    id: string
    questionText: string
    explanation: string | null
    options: QuestionOption[]
    correctAnswer: CorrectAnswer

}
