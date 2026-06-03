"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { UpdateAttendanceSessionInput } from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function saveAttendanceRecords(
    data: UpdateAttendanceSessionInput,
): Promise<void> {
    const response =
        await fetch(
            "/api/admin/attendance/save-records",
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
            "Failed to save attendance",
        );
    }
}

export function useSaveAttendanceRecords() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            saveAttendanceRecords,

        onSuccess: (
            _data,
            variables,
        ) => {
            void queryClient.invalidateQueries(
                {
                    queryKey:
                        attendanceQueryKeys.session(
                            variables.session_id,
                        ),
                },
            );

            void queryClient.invalidateQueries(
                {
                    queryKey:
                        attendanceQueryKeys.all,
                },
            );
        },
    });
}
