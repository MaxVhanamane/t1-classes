import type { MentorshipSessionFilters } from "../types/mentorship-filters";

export const mentorshipQueryKeys = {
    all: ["admin-mentorship-sessions"] as const,

    lists: () =>
        [...mentorshipQueryKeys.all, "list"] as const,

    list: (filters: MentorshipSessionFilters) =>
        [
            ...mentorshipQueryKeys.lists(),
            filters.page,
            filters.search,
            filters.batchId,
            filters.status,
            filters.audienceType,
            filters.createdBy,
        ] as const,

    students: (sessionId: string) =>
        [
            ...mentorshipQueryKeys.all,
            "students",
            sessionId,
        ] as const,
};
