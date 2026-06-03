"use client";

import { useQuery } from "@tanstack/react-query";

import { AttendanceBatchOption } from "../types/attendance";
import { attendanceQueryKeys } from "../constants/query-keys";


async function fetchAttendanceBatches(): Promise<
    AttendanceBatchOption[]
> {
    const response =
        await fetch(
            "/api/admin/attendance/batches",
            {
                credentials:
                    "include",
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
            "Failed to load batches",
        );
    }

    return response.json();
}

export function useAttendanceBatches() {
    return useQuery({
        queryKey:
            attendanceQueryKeys.batches(),

        queryFn:
            fetchAttendanceBatches,

        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,
    });
}
