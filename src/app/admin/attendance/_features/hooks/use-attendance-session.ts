"use client";

import { useQuery } from "@tanstack/react-query";

import { AttendanceSessionDetail } from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function fetchAttendanceSession(
    sessionId: string,
): Promise<AttendanceSessionDetail> {
    const searchParams =
        new URLSearchParams({
            sessionId,
        });

    const response =
        await fetch(
            `/api/admin/attendance/session?${searchParams.toString()}`,
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
            "Failed to load attendance session",
        );
    }

    return response.json();
}

export function useAttendanceSession(
    sessionId?: string,
) {
    return useQuery({
        queryKey:
            attendanceQueryKeys.session(
                sessionId ?? "",
            ),

        queryFn: () =>
            fetchAttendanceSession(
                sessionId!,
            ),

        enabled:
            !!sessionId,

        staleTime:
            1000 * 60,

        gcTime:
            1000 * 60 * 5,
    });
}
