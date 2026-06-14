import { BatchFilters } from "../types/batch-filters";

export const BATCH_ACTIVE_FILTERS = [
    "all",
    "active",
    "inactive",
] as const;

export const BATCH_LIFECYCLE_FILTERS = [
    "upcoming",
    "ongoing",
    "completed",
] as const;

export const BATCH_ADMISSION_FILTERS = [
    "open",
    "closed",
] as const;

export type BatchActiveFilter =
    (typeof BATCH_ACTIVE_FILTERS)[number];

export type BatchLifecycleFilter =
    (typeof BATCH_LIFECYCLE_FILTERS)[number];

export type BatchAdmissionFilter =
    (typeof BATCH_ADMISSION_FILTERS)[number];

export const DEFAULT_BATCH_FILTERS: BatchFilters = {
    search: "",

    active: "all",

    lifecycle: null,

    admission: null,

    category: null,

    board: null,

    mode: null,

    classLevel: null,

    targetExam: null,

    courseId: null,

    instructorId: null,

    page: 1,
};

