import type { NotificationFilters } from "../types/notification-filters";

export const NOTIFICATION_TYPE_FILTERS = [
    "all",
    "announcement",
    "reminder",
    "test",
    "system",
    "course",
    "batch",
] as const satisfies readonly NotificationFilters["type"][];

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
    search: "",

    type: "all",

    batchId: null,

    page: 1,
};
