import type {
    CourseActiveFilter,
    CourseFilters,
} from "../types/course-filters";

export const COURSE_ACTIVE_FILTERS: CourseActiveFilter[] =
    [
        "all",
        "active",
        "inactive",
    ];

export const DEFAULT_COURSE_FILTERS: CourseFilters =
{
    search: "",

    active: "all",

    category: null,

    board: null,

    classLevel: null,

    targetExam: null,

    instructorId: null,

    page: 1,
};
