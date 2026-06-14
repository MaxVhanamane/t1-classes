import type { TestFilters } from "../types/test-filters";

export const TEST_LOCKED_FILTERS = [
    "all",
    "locked",
    "unlocked",
] as const;

export const DEFAULT_TEST_FILTERS: TestFilters = {
    search: "",

    createdBy: "me",

    testType: null,

    locked: "all",

    page: 1,
};
