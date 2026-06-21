"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";
import { QuestionTimer } from "./use-question-time-tracker";

type SubmitSource = "manual" | "auto";

export function useTestSubmit(attemptId: string, timer: QuestionTimer,) {
    const [locked, setLocked] = useState(false);
    const [failed, setFailed] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();

    // Prevent duplicate submissions
    const hasSubmittedRef = useRef(false);

    const mutation = useMutation({
        mutationFn: ({
        }: {
            source: SubmitSource;
        }) => {
            timer.flushCurrentQuestion();

            return fetchWrapper(
                `/api/tests/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        pendingTimes:
                            timer.getPendingTimes(),
                    }),
                },
            );
        },

        onMutate: ({ source }) => {
            hasSubmittedRef.current = true;

            setLocked(true);
            setFailed(false);

            if (source === "auto") {
                toast.warning(
                    "Time's up! Auto-submitting your test..."
                );
            }
        },

        onSuccess: (data) => {
            timer.clear();

            queryClient.setQueryData(
                ["result-summary", attemptId],
                data,
            );

            toast.success(
                "Test submitted successfully",
            );
            // Let React flush state updates first
            setLocked(false);
            // Remove submission guard before navigation
            setTimeout(() => {
                router.replace(
                    `/student/tests/results/${attemptId}`,
                );
            }, 0);
        },

        onError: (
            _error,
            { source }
        ) => {
            toast.error(
                source === "auto"
                    ? "Autosubmit failed! You can retry manually."
                    : "Submission failed! Please retry."
            );

            setFailed(true);
            setLocked(false);

            // Allow another attempt
            hasSubmittedRef.current = false;
        },
    });

    function submitTest(source: SubmitSource) {
        // Prevent double submits
        if (
            hasSubmittedRef.current ||
            mutation.isPending
        ) {
            return;
        }

        mutation.mutate({ source });
    }

    return {
        submitTest,
        locked,
        failed,
        isSubmitting: mutation.isPending,
    };
}
