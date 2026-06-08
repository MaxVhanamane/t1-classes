import { QuestionPaperFilters } from "@/src/app/admin/question-papers/_features/types/question-paper";

export const courseQuestionPaperAttachmentQueryKeys =
{
    details: (
        courseId: string,
    ) => [
        "course-question-paper-attachment",
        "details",
        courseId,
    ] as const,

    questionPapers: (
        courseId: string,
    ) => [
        "course-question-paper-attachment",
        "question-papers",
        courseId,
    ] as const,
    availableQuestionPapers: (
        courseId: string,
        filters: QuestionPaperFilters,
    ) =>
        [
            "course-question-paper-attachment",
            "available-question-papers",
            courseId,
            filters,
        ] as const,
};
