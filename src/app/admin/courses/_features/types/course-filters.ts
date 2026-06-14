import type {
    Board,
    Category,
    TargetExam,
} from "../../../batches/_features/zod-schema/schema";

export type CourseActiveFilter =
    | "all"
    | "active"
    | "inactive";

export type CourseFilters = {
    search: string;

    active: CourseActiveFilter;

    category:
    | Category
    | null;

    board:
    | Board
    | null;

    classLevel:
    | number
    | null;

    targetExam:
    | TargetExam
    | null;

    instructorId:
    | string
    | null;

    page: number;
};
