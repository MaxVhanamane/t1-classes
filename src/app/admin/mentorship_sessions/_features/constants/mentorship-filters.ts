import { MentorshipSessionFilters } from "../types/mentorship-filters";

export const DEFAULT_MENTORSHIP_FILTERS: MentorshipSessionFilters = {
    search: "",
    batchId: "all",
    status: "all",
    audienceType: "all",
    createdBy: "all",
    page: 1,
};

export const MENTORSHIP_STATUS_FILTERS = [
    {
        label: "All statuses",
        value: "all",
    },
    {
        label: "Scheduled",
        value: "scheduled",
    },
    {
        label: "Ready",
        value: "ready",
    },
    {
        label: "Live",
        value: "live",
    },
    {
        label: "Completed",
        value: "completed",
    },
] as const;

export const MENTORSHIP_AUDIENCE_FILTERS = [
    {
        label: "All audiences",
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
] as const;
