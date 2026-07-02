export type NotificationFilters = {
    search: string;

    type:
    | "all"
    | "announcement"
    | "reminder"
    | "test"
    | "system"
    | "course"
    | "batch";

    batchId: string | null;

    page: number;
};
