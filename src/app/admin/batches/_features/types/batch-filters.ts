import type {
    BatchMode,
    Board,
    Category,
    TargetExam,
} from "../zod-schema/schema";

export type BatchLifecycleFilter =
    | "upcoming"
    | "ongoing"
    | "completed";

export type BatchAdmissionFilter =
    | "open"
    | "closed";

export type BatchActiveFilter =
    | "all"
    | "active"
    | "inactive";

export type BatchFilters = {
    search: string;

    active: BatchActiveFilter;

    lifecycle:
    | BatchLifecycleFilter
    | null;

    admission:
    | BatchAdmissionFilter
    | null;

    category:
    | Category
    | null;

    board:
    | Board
    | null;

    mode:
    | BatchMode
    | null;

    classLevel:
    | number
    | null;

    targetExam:
    | TargetExam
    | null;

    courseId:
    | string
    | null;

    instructorId:
    | string
    | null;

    page: number;
};
