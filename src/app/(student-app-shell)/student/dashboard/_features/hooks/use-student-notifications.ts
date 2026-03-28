import { useQuery } from "@tanstack/react-query";

type Notification = {
    id: string;
    title: string | null;
    message: string;
    type: string;
    created_at: string;
};

type Response = {
    notifications: Notification[];
    unread_count: number;
};

export function useStudentNotifications() {
    return useQuery<Response>({
        queryKey: ["student-notifications"],
        queryFn: async () => {
            const res = await fetch("/api/notifications/student");

            if (!res.ok) {
                throw new Error("Failed to fetch notifications");
            }

            return res.json();
        },
        staleTime: 1000 * 60, // 1 min (no unnecessary refetch)
    });
}
