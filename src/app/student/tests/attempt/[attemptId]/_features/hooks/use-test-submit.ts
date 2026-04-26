"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

export function useTestSubmit(attemptId: string) {
    const [locked, setLocked] = useState(false);
    const [failed, setFailed] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () =>
            fetchWrapper(
                `/api/tests/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                }
            ),

        onMutate: () => {
            setLocked(true);
            setFailed(false);
        },

        onSuccess: (data) => {
            queryClient.setQueryData(
                ["result-summary", attemptId],
                data
            );

            router.replace(
                `/student/tests/results/${attemptId}`
            );
        },

        onError: () => {
            toast.error(
                "Autosubmit failed — you can retry manually"
            );

            setFailed(true);
            setLocked(false);
        },
    });

    useEffect(() => {
        function handler() {
            if (!mutation.isPending) {
                mutation.mutate();
            }
        }

        window.addEventListener(
            "exam-autosubmit",
            handler
        );

        return () =>
            window.removeEventListener(
                "exam-autosubmit",
                handler
            );
    }, [mutation]);

    return {
        submit: mutation.mutate,
        locked,
        failed,
        isSubmitting: mutation.isPending,
    };
}
