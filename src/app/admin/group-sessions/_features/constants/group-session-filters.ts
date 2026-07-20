import type { GroupSessionFilters } from "../types/group-session-filters";

export const DEFAULT_GROUP_SESSION_FILTERS: GroupSessionFilters = {
    search: "",
    batchId: "all",
    status: "all",
    audienceType: "all",
    createdBy: "all",
    page: 1,
};

export const GROUP_SESSION_STATUS_FILTERS = [
    {
        label: "All Statuses",
        value: "all",
    },
    {
        label: "Waiting",
        value: "waiting",
    },
    {
        label: "Scheduled",
        value: "scheduled",
    },
    {
        label: "Live",
        value: "live",
    },
    {
        label: "Ended",
        value: "ended",
    },
] satisfies ReadonlyArray<{
    label: string;
    value: GroupSessionFilters["status"];
}>;

export const GROUP_SESSION_AUDIENCE_FILTERS = [
    {
        label: "All Audiences",
        value: "all",
    },
    {
        label: "Batch",
        value: "batch",
    },
    {
        label: "Selected Students",
        value: "selected_students",
    },
] satisfies ReadonlyArray<{
    label: string;
    value: GroupSessionFilters["audienceType"];
}>;
