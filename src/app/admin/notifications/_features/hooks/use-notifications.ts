import { useQuery } from "@tanstack/react-query";
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
    return useQuery({
        queryKey: ["admin-notifications"],
        queryFn: async () => {
            const res = await fetch("/api/admin/notifications");

            if (!res.ok) {
                throw new Error("Failed to load notifications");
            }

            return (await res.json()) as NotificationRow[];
        },
    });
}
