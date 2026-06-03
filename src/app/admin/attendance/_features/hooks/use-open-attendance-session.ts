"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    CreateAttendanceSessionInput,
    CreateAttendanceSessionResponse,
} from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function openAttendanceSession(
    data: CreateAttendanceSessionInput,
): Promise<CreateAttendanceSessionResponse> {
    const response =
        await fetch(
            "/api/admin/attendance/open-session",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    data,
                ),
            },
        );

    if (!response.ok) {
        const error =
            await response
                .json()
                .catch(
                    () => null,
                );

        throw new Error(
            error?.message ??
            "Failed to open attendance session",
        );
    }

    return response.json();
}

export function useOpenAttendanceSession() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            openAttendanceSession,

        onSuccess: (
            data,
        ) => {
            void queryClient.invalidateQueries(
                {
                    queryKey:
                        attendanceQueryKeys.batches(),
                },
            );

            void queryClient.prefetchQuery(
                {
                    queryKey:
                        attendanceQueryKeys.session(
                            data.sessionId,
                        ),

                    queryFn:
                        async () => {
                            const response =
                                await fetch(
                                    `/api/admin/attendance/session?sessionId=${data.sessionId}`,
                                );

                            if (
                                !response.ok
                            ) {
                                throw new Error(
                                    "Failed to load attendance session",
                                );
                            }

                            return response.json();
                        },
                },
            );
        },
    });
}
