import { Subject, TargetExam } from "../../../../batches/_features/zod-schema/schema";

export type HomeworkType = "dpp" | "assignment";
export type HomeworkDifficulty = "easy" | "medium" | "hard" | "mixed";

export interface HomeworkChapter {
    id: string;
    class_level: number | null;
    subject: Subject;
    target_exam: TargetExam | null;
    chapter_number: number | null;
    chapter_name: string;
    created_at: string;
}

export interface HomeworkMaterial {
    id: string;
    chapter_id: string;
    title: string;
    description: string | null;
    homework_type: HomeworkType;
    difficulty: HomeworkDifficulty;
    file_path: string;
    file_size: number;
    solution_file_path: string | null;
    solution_file_size: number | null;
    created_at: string;

    chapter?: {
        chapter_name: string;
        class_level: number | null;
        subject: Subject;
        target_exam: TargetExam | null;
    };
}

export interface HomeworkMaterialFilters {
    search: string;
    classLevel: number | null;
    subject: Subject | null;
    targetExam: TargetExam | null;
    chapterId: string | null;
    homeworkType: HomeworkType | null;
    difficulty: HomeworkDifficulty | null;
    page: number;
}

export interface HomeworkMaterialListResponse {
    items: HomeworkMaterial[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
