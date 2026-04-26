"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

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

        queryFn: () =>
            fetchWrapper<Response>(
                "/api/notifications/student"
            ),

        staleTime: 1000 * 60, // 1 min (no unnecessary refetch)
    });
}
