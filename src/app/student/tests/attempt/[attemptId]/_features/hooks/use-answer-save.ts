"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { StateItem } from "../types/workspace.types";
import { QuestionTimer } from "./use-question-time-tracker";

export type SavePayload = {
    questionId: string;
    answer: unknown | null;
    markedForReview: boolean;
    timeSpentSeconds: number;
};

type SaveAnswerResponse = {
    ok: boolean;
    attemptId: string;
    questionId: string;
    savedAt: string | null;
    markedForReview: boolean;
    timeSpentSeconds: number;
};

export function useAnswerSave({
    attemptId,
    timer,
}: {
    attemptId: string;
    timer: QuestionTimer;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["answer", attemptId],

        mutationFn: (
            payload: SavePayload,
        ): Promise<SaveAnswerResponse> =>
            fetchWrapper(
                `/api/tests/attempts/${attemptId}/answer`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            ),

        retry: 3,

        retryDelay: (attemptIndex) =>
            Math.min(
                800 * 2 ** attemptIndex,
                4000,
            ),

        // =====================================
        // OPTIMISTIC UPDATE
        // =====================================
        onMutate: async (payload) => {
            const previousState =
                queryClient.getQueryData<StateItem[]>(
                    ["attempt-state", attemptId],
                ) ?? [];

            const nextState = [...previousState];

            const index = nextState.findIndex(
                (s) =>
                    s.questionId ===
                    payload.questionId,
            );

            const existing =
                index !== -1
                    ? nextState[index]
                    : undefined;

            const updatedItem: StateItem = {
                questionId: payload.questionId,
                answer: payload.answer,
                visited: true,
                markedForReview:
                    payload.markedForReview,

                // Keep existing server time
                timeSpentSeconds:
                    existing?.timeSpentSeconds ??
                    0,
            };

            if (index === -1) {
                nextState.push(updatedItem);
            } else {
                nextState[index] = updatedItem;
            }

            queryClient.setQueryData(
                ["attempt-state", attemptId],
                nextState,
            );

            return {
                previousState,
            };
        },

        // =====================================
        // SUCCESS
        // =====================================
        onSuccess: (
            data,
            variables,
        ) => {
            timer.markQuestionSynced(
                variables.questionId,
            );

            queryClient.setQueryData<StateItem[]>(
                ["attempt-state", attemptId],
                (prev = []) =>
                    prev.map((item) =>
                        item.questionId ===
                            variables.questionId
                            ? {
                                ...item,
                                timeSpentSeconds:
                                    data.timeSpentSeconds,
                            }
                            : item,
                    ),
            );
        },

        // =====================================
        // ROLLBACK
        // =====================================
        onError: (
            _err,
            _vars,
            ctx,
        ) => {
            if (ctx?.previousState) {
                queryClient.setQueryData(
                    ["attempt-state", attemptId],
                    ctx.previousState,
                );
            }

            toast.error(
                "Unable to save your answer. Please check your connection and try again.",
            );
        },
    });

    return {
        mutate: mutation.mutate,
        isSaving: mutation.isPending,
    };
}
