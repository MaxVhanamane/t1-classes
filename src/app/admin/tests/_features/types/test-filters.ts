import type { TestType } from "./test.types";

export type TestFilters = {
    search: string;

    createdBy: string | "me" | null;

    testType: TestType | null;

    locked: "all" | "locked" | "unlocked";

    page: number;
};
