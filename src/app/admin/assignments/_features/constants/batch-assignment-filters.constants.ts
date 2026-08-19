import type { BatchAssignmentFilters } from "../types/batch-assignments.types";

export const ASSIGNMENT_STATUS_FILTERS = [
    "all",
    "scheduled",
    "ongoing",
    "completed",
] as const satisfies readonly BatchAssignmentFilters["status"][];

export const DEFAULT_ASSIGNMENT_FILTERS: BatchAssignmentFilters = {
    search: "",
    subject: "all",
    status: "all",
    page: 1,
};
