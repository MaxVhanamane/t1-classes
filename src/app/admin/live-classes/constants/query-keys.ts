import { LiveClassFilters } from "../_features/types/live-class-filters";

export const liveClassQueryKeys = {
    all: ["admin-live-classes"] as const,

    lists: () =>
        [...liveClassQueryKeys.all, "list"] as const,

    list: (filters: LiveClassFilters) =>
        [
            ...liveClassQueryKeys.lists(),
            filters.page,
            filters.search,
            filters.batchId,
            filters.status,
            filters.createdBy,
        ] as const,
};
