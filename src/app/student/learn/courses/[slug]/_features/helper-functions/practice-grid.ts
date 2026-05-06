import { PracticeSessionQuestion } from "../types/practice-session.types";

export type QuestionState =
    | "not_visited"
    | "not_answered"
    | "answered"
    | "review"
    | "answered_review";

export function getQuestionState({
    visited,
    answers,
    markedForReview,
    questionId,
}: {
    visited: Set<string>;
    answers: Record<string, string>;
    markedForReview: Set<string>;
    questionId: string;
}): QuestionState {
    const isVisited = visited.has(questionId);
    const isAnswered = !!answers[questionId];
    const isReview = markedForReview.has(questionId);

    if (!isVisited) return "not_visited";
    if (isAnswered && isReview) return "answered_review";
    if (isReview) return "review";
    if (isAnswered) return "answered";
    return "not_answered";
}

export function getGridStyles(state: QuestionState) {
    const base = `
    border
    transition-all
  `;

    switch (state) {
        case "answered":
            return `${base} dark:bg-emerald-500/10 bg-green-200 border-emerald-500/40 text-emerald-600`;

        case "review":
            return `${base} dark:bg-purple-500/10 bg-purple-200 border-purple-500/40 text-purple-600`;

        case "answered_review":
            return `${base} dark:bg-blue-500/10 bg-blue-200 border-blue-500/40 text-blue-600`;

        case "not_answered":
            return `${base} dark:bg-yellow-500/10 bg-yellow-200 border-yellow-500/40 text-yellow-600`;

        case "not_visited":
        default:
            return `${base} dark:bg-muted bg-gray-50 border-border text-muted-foreground`;
    }
}


export type ReviewState =
    | "correct"
    | "incorrect"
    | "not_answered";

export function getReviewState({
    answers,
    question,
}: {
    answers: Record<string, string>;
    question: PracticeSessionQuestion;
}): ReviewState {
    const answer = answers[question.id];

    if (!answer) return "not_answered";

    const correctOption = question.options.find(o => o.is_correct);

    if (correctOption?.id === answer) return "correct";

    return "incorrect";
}

export function getReviewStyles(state: ReviewState) {
    const base = "border";

    switch (state) {
        case "correct":
            return `${base} bg-emerald-500/10 border-emerald-500/40 text-emerald-600`;

        case "incorrect":
            return `${base} bg-red-500/10 border-red-500/40 text-red-600`;

        case "not_answered":
        default:
            return `${base} bg-slate-500/10 border-slate-500/40 text-slate-600`;
    }
}
