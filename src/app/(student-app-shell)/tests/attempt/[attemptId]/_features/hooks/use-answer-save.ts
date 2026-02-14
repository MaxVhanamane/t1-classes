"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { optimisticUpdateGrid } from "../helpers/grid-optimistic";
import { GridItem, GridState } from "../types/grid.types";
import { StateItem } from "../types/workspace.types";

export type SavePayload = {
    questionId: string;
    answer: unknown | null;
    markedForReview: boolean;
};

export function useAnswerSave({ attemptId }: { attemptId: string }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["answer", attemptId],

        mutationFn: async (payload: SavePayload) => {
            const res = await fetch(
                `/api/tests/attempts/${attemptId}/answer`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Save failed");
            }

            return res.json();
        },

        retry: 3,
        retryDelay: 1000,

        // =========================================
        // OPTIMISTIC UPDATE
        // =========================================
        onMutate: async (payload) => {
            await queryClient.cancelQueries({
                queryKey: ["grid", attemptId],
            });

            const previousGrid =
                queryClient.getQueryData<GridItem[]>([
                    "grid",
                    attemptId,
                ]);

            const previousState =
                queryClient.getQueryData<StateItem[]>([
                    "attempt-state",
                    attemptId,
                ]) ?? [];

            // -----------------------------
            // GRID
            // -----------------------------
            const nextGridState: GridState = payload.markedForReview
                ? payload.answer
                    ? "answered_review"
                    : "review"
                : payload.answer
                    ? "answered"
                    : "not_answered";

            if (Array.isArray(previousGrid)) {
                queryClient.setQueryData<GridItem[]>(
                    ["grid", attemptId],
                    optimisticUpdateGrid(
                        previousGrid,
                        payload.questionId,
                        nextGridState
                    )
                );
            }

            // -----------------------------
            // ATTEMPT STATE
            // -----------------------------
            const nextState = [...previousState];

            const index = nextState.findIndex(
                (s) => s.questionId === payload.questionId
            );

            const updatedItem: StateItem = {
                questionId: payload.questionId,
                answer: payload.answer,
                visited: true,
                markedForReview: payload.markedForReview,
            };

            if (index === -1) {
                nextState.push(updatedItem);
            } else {
                nextState[index] = updatedItem;
            }

            queryClient.setQueryData(
                ["attempt-state", attemptId],
                nextState
            );

            return {
                previousGrid,
                previousState,
            };
        },

        // =========================================
        // ROLLBACK
        // =========================================
        onError: (_err, _vars, ctx) => {
            if (ctx?.previousGrid) {
                queryClient.setQueryData(
                    ["grid", attemptId],
                    ctx.previousGrid
                );
            }

            if (ctx?.previousState) {
                queryClient.setQueryData(
                    ["attempt-state", attemptId],
                    ctx.previousState
                );
            }

            toast.error("Save failed — reconnecting…");
        },

        // =========================================
        // RECONCILE
        // =========================================
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: ["grid", attemptId],
            });
        },
    });

    return {
        mutate: mutation.mutate,
        isSaving: mutation.isPending,
    };
}
