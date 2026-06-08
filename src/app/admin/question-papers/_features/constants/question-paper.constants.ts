import type {
    QuestionPaperCategory,
    QuestionPaperFilters,
} from "../types/question-paper";

export const QUESTION_PAPER_CATEGORIES: {
    label: string;
    value: QuestionPaperCategory;
}[] = [
        {
            label: "Previous Year",
            value: "previous_year",
        },
        {
            label: "Practice",
            value: "practice",
        },
    ];

export const QUESTION_PAPER_DEFAULT_PAGE_SIZE =
    20;

export const QUESTION_PAPER_PAGE_SIZE_OPTIONS =
    [10, 20, 50, 100] as const;

export const DEFAULT_QUESTION_PAPER_FILTERS: QuestionPaperFilters =
{
    search: "",

    targetExam: null,
    classLevel: null,

    subject: null,

    category: null,

    page: 1,

    pageSize:
        QUESTION_PAPER_DEFAULT_PAGE_SIZE,
};
export const QUESTION_PAPER_YEAR_OPTIONS =
    Array.from(
        {
            length: 15,
        },
        (_, index) =>
            new Date().getFullYear() -
            index,
    );
