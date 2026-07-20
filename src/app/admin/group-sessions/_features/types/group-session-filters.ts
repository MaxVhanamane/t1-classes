export type GroupSessionStatus =
    | "all"
    | "waiting"
    | "scheduled"
    | "live"
    | "ended";

export type GroupSessionAudienceFilter =
    | "all"
    | "batch"
    | "selected_students";

export interface GroupSessionFilters {
    search: string;

    batchId: string;

    status: GroupSessionStatus;

    audienceType: GroupSessionAudienceFilter;

    createdBy: string;

    page: number;
}
