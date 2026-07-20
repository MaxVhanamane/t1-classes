import { LiveClassFilters } from "../_features/types/live-class-filters";

export const DEFAULT_LIVE_CLASS_FILTERS: LiveClassFilters = {
    search: "",
    batchId: "all",
    status: "all",
    createdBy: "all",
    page: 1,
};

export const LIVE_CLASS_STATUS_FILTERS = [
    {
        label: "All statuses",
        value: "all",
    },
    {
        label: "Upcoming",
        value: "upcoming",
    },
    {
        label: "Live",
        value: "live",
    },
    {
        label: "Ended",
        value: "ended",
    },
] as const;
