import { GroupSessionFilters } from "../types/group-session-filters";

export const groupSessionsQueryKeys = {
    all: ["admin-group-sessions"] as const,

    lists: () =>
        [...groupSessionsQueryKeys.all, "list"] as const,

    list: (filters: GroupSessionFilters) =>
        [
            ...groupSessionsQueryKeys.lists(),
            {
                page: filters.page,
                search: filters.search,
                batchId: filters.batchId,
                status: filters.status,
                audienceType: filters.audienceType,
                createdBy: filters.createdBy,
            },
        ] as const,

    students: (sessionId: string) =>
        [
            ...groupSessionsQueryKeys.all,
            "students",
            sessionId,
        ] as const,
};
