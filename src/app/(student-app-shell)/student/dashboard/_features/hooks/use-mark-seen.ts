import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkNotificationsSeen() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/notifications/student/seen", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed");
            }
        },

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
                (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        unread_count: 0,
                    };
                }
            );

            return { previous };
        },

        //  rollback if API fails
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    ["student-notifications"],
                    context.previous
                );
            }
        },

        // optional: keep cache fresh
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: ["student-notifications"],
            });
        },
    });
}
