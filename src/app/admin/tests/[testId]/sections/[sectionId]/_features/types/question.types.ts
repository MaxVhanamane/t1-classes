import { CorrectAnswer } from "./correct-answer.types"
import { JSONContent } from "@tiptap/react"
export type QuestionOption = {
    id: string
    label: string
    text: JSONContent
}


export type TestQuestion = {
    id: string
    questionText: JSONContent
    explanation: JSONContent | null
    options: QuestionOption[]
    correctAnswer: CorrectAnswer

}


export type PaginatedQuestionsResponse = {
    items: TestQuestion[];

    total: number;

    page: number;

    pageSize: number;

    totalPages: number;
};
