import { QuestionPaperFilters } from "@/src/app/admin/question-papers/_features/types/question-paper";

export const batchQuestionPaperAttachmentQueryKeys =
{
    details: (
        batchId: string,
    ) => [
        "batch-question-paper-attachment",
        "details",
        batchId,
    ] as const,

    questionPapers: (
        batchId: string,
    ) => [
        "batch-question-paper-attachment",
        "question-papers",
        batchId,
    ] as const,

    availableQuestionPapers: (
        batchId: string,
        filters: QuestionPaperFilters,
    ) =>
        [
            "batch-question-paper-attachment",
            "available-question-papers",
            batchId,
            filters,
        ] as const,
};



