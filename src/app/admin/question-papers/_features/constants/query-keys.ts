import { QuestionPaperFilters } from "../types/question-paper";

export const questionPaperQueryKeys = {
    all: ["question-papers"] as const,

    lists: () =>
        [...questionPaperQueryKeys.all, "list"] as const,

    list: (
        filters: QuestionPaperFilters,
    ) =>
        [
            ...questionPaperQueryKeys.lists(),
            filters,
        ] as const,

    details: () =>
        [...questionPaperQueryKeys.all, "detail"] as const,

    detail: (id: string) =>
        [
            ...questionPaperQueryKeys.details(),
            id,
        ] as const,
};
