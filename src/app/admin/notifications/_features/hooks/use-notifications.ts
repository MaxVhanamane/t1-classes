import { useQuery } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import type { NotificationType } from "../types/notification.types";
import type { NotificationFilters } from "../types/notification-filters";

export type NotificationRow = {
    id: string;

    title: string | null;

    message: string;

    type: NotificationType;

    created_at: string;

    batch_id: string | null;

    batches: {
        title: string;
    } | null;
};

export type NotificationListResponse = {
    items: NotificationRow[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};

async function fetchNotifications(
    filters: NotificationFilters,
): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();

    if (filters.search) {
        searchParams.set("search", filters.search);
    }

    searchParams.set("type", filters.type);

    if (filters.batchId) {
        searchParams.set("batchId", filters.batchId);
    }

    searchParams.set("page", String(filters.page));

    return fetchWrapper<NotificationListResponse>(
        `/api/admin/notifications?${searchParams.toString()}`,
    );
}

export function useNotifications(
    filters: NotificationFilters,
) {
    return useQuery({
        queryKey: [
            "admin",
            "notifications",
            filters,
        ],

        queryFn: () => fetchNotifications(filters),

        placeholderData:
            filters.page > 1
                ? (previousData) => previousData
                : undefined,

        staleTime: 1000 * 60,

        gcTime: 1000 * 60 * 30,
    });
}
