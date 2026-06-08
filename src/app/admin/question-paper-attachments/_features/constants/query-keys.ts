export const questionPaperAttachmentQueryKeys = {
    all: ["question-paper-attachments"] as const,

    batches: () =>
        [
            ...questionPaperAttachmentQueryKeys.all,
            "batches",
        ] as const,

    batchList: (
        filters: {
            search: string;
            classLevel: number | null;
            targetExam: string | null;
            page: number;
            pageSize: number;
        },
    ) =>
        [
            ...questionPaperAttachmentQueryKeys.batches(),
            filters,
        ] as const,

    courses: () =>
        [
            ...questionPaperAttachmentQueryKeys.all,
            "courses",
        ] as const,

    courseList: (
        filters: {
            search: string;
            classLevel: number | null;
            targetExam: string | null;
            page: number;
            pageSize: number;
        },
    ) =>
        [
            ...questionPaperAttachmentQueryKeys.courses(),
            filters,
        ] as const,
};
