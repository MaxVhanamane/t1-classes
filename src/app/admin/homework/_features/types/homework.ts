import { Subject, TargetExam } from "@/src/app/admin/batches/_features/zod-schema/schema";
import { HomeworkChapter } from "../../[chapterId]/_features/types/homework";

export interface HomeworkChapterFilters {
    search: string;
    classLevel: number | null;
    subject: Subject | null;
    targetExam: TargetExam | null;
    page: number;
}

export interface HomeworkChapterListResponse {
    items: HomeworkChapter[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
