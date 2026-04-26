"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

export function useMarkNotificationsSeen() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            fetchWrapper<{ success: true }>(
                "/api/notifications/student/seen",
                {
                    method: "POST",
                }
            ),

        // optimistic update (instant)
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: ["student-notifications"],
            });

            const previous = queryClient.getQueryData([
                "student-notifications",
            ]);

            queryClient.setQueryData(
                ["student-notifications"],
                (old: unknown) => {
                    if (!old) return old;

                    return {
                        ...(old as Record<string, unknown>),
                        unread_count: 0,
                    };
                }
            );

            return { previous };
        },

        // rollback if API fails
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    ["student-notifications"],
                    context.previous
                );
            }
        },

        // keep cache fresh
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: ["student-notifications"],
            });
        },
    });
}
