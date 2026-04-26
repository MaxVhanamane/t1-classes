import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { NotificationType } from "../types/notification.types";

export type NotificationRow = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    created_at: string;
    batch_id: string | null;
    batches?: { title: string };
};

export function useNotifications() {
    return useQuery<NotificationRow[]>({
        queryKey: ["admin-notifications"],
        queryFn: () =>
            fetchWrapper<NotificationRow[]>(
                "/api/admin/notifications"
            ),
    });
}
