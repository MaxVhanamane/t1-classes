"use client";

import { useQuery } from "@tanstack/react-query";

import { AttendanceStudentOption } from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function fetchAttendanceStudents(
    batchId: string,
): Promise<
    AttendanceStudentOption[]
> {
    const response =
        await fetch(
            `/api/admin/attendance/students?batchId=${batchId}`,
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
            "Failed to load students",
        );
    }

    return response.json();
}

export function useAttendanceStudents(
    batchId?: string,
) {
    return useQuery({
        queryKey:
            attendanceQueryKeys.students(
                batchId,
            ),

        queryFn: () =>
            fetchAttendanceStudents(
                batchId!,
            ),

        enabled:
            !!batchId,

        staleTime:
            1000 * 60,

        gcTime:
            1000 * 60 * 5,
    });
}
