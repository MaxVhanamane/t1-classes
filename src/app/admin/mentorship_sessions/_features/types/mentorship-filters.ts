export interface MentorshipSessionFilters {
    search: string;

    batchId: string;

    status: "all" | "scheduled" | "ready" | "live" | "completed";

    audienceType: "all" | "batch" | "selected_students";

    createdBy: string;

    page: number;
}
