import { HomeworkMaterialFilters } from "../types/homework";

export const homeworkQueryKeys = {
    all: ["homework-materials"] as const,

    lists: () => [...homeworkQueryKeys.all, "list"] as const,

    list: (filters: HomeworkMaterialFilters) =>
        [...homeworkQueryKeys.lists(), filters] as const,

    chapters: () => ["homework-chapters"] as const,

    chaptersList: (subject?: string | null, classLevel?: number | null) =>
        [...homeworkQueryKeys.chapters(), { subject, classLevel }] as const,
};
