import { JSONContent } from "@tiptap/react";

/* -------------------------------------------------------------------------- */
/* Answer Modes                                                               */
/* -------------------------------------------------------------------------- */
export type AnswerMode =
    | "single_select"
    | "multi_select"
    | "numerical_input"
    | "match_matrix";

/* -------------------------------------------------------------------------- */
/* Practice Question Option                                                   */
/* -------------------------------------------------------------------------- */
export interface PracticeQuestionOption {
    id: string;
    option_label: string;
    option_text: JSONContent;
    sort_order: number;
}

/* -------------------------------------------------------------------------- */
/* Correct Answer Structure                                                   */
/* -------------------------------------------------------------------------- */
export interface CorrectAnswer {
    option_id: string;
}
/* -------------------------------------------------------------------------- */
/* Practice Question                                                          */
/* -------------------------------------------------------------------------- */
export interface PracticeQuestion {
    id: string;
    question: JSONContent;
    explanation: JSONContent | null;
    correct_answer: CorrectAnswer | null;
    answer_mode: AnswerMode;
    sort_order: number;
    practice_question_options: PracticeQuestionOption[];
}
