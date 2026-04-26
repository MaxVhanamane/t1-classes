"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StateItem } from "../types/workspace.types";

export function useAttemptState(
    attemptId: string,
    initialState: StateItem[]
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["attempt-state", attemptId],
        queryFn: () => initialState,

        initialData: initialState,

        staleTime: Infinity,
        gcTime: Infinity,

        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    function setState(next: StateItem[]) {
        queryClient.setQueryData<StateItem[]>(
            ["attempt-state", attemptId],
            next
        );
    }

    function updateOne(
        questionId: string,
        updater: (s: StateItem) => StateItem
    ) {
        queryClient.setQueryData<StateItem[]>(
            ["attempt-state", attemptId],
            (old = []) =>
                old.map((item) =>
                    item.questionId === questionId ? updater(item) : item
                )
        );
    }

    return {
        state: query.data ?? [],
        setState,
        updateOne,
    };
}
