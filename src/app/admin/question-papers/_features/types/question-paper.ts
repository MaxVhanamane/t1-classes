import { SUBJECTS, TARGET_EXAMS } from "../../../batches/_features/zod-schema/schema";

export type QuestionPaperCategory =
    | "previous_year"
    | "practice";

export type QuestionPaper = {
    id: string;

    title: string;

    description: string | null;

    class_level: number | null;

    target_exam:
    | (typeof TARGET_EXAMS)[number]
    | null;

    subject:
    | (typeof SUBJECTS)[number]
    | null;

    paper_category:
    QuestionPaperCategory;

    years: number[];

    file_path: string;

    file_size: number | null;

    created_at: string;
};
export type QuestionPaperListItem =
    Pick<
        QuestionPaper,
        | "id"
        | "title"
        | "description"
        | "class_level"
        | "target_exam"
        | "subject"
        | "paper_category"
        | "years"
        | "file_size"
        | "created_at"
    >;

export type QuestionPaperListResponse = {
    items: QuestionPaper[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export type QuestionPaperFilters = {
    search: string;

    classLevel: number | null;

    targetExam: string | null;

    subject:
    | (typeof SUBJECTS)[number]
    | null;

    category:
    | QuestionPaperCategory
    | null;

    page: number;

    pageSize: number;
};
