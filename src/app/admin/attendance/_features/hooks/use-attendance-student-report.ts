"use client";

import {
    useQuery,
    UseQueryOptions,
} from "@tanstack/react-query";

import {
    AttendanceStudentReportFilters,
    AttendanceStudentReportResponse,
} from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function fetchAttendanceStudentReport(
    filters: AttendanceStudentReportFilters,
): Promise<AttendanceStudentReportResponse> {
    const searchParams =
        new URLSearchParams();

    searchParams.set(
        "batchId",
        filters.batchId,
    );

    searchParams.set(
        "userId",
        filters.userId,
    );

    searchParams.set(
        "page",
        String(filters.page),
    );

    searchParams.set(
        "pageSize",
        String(filters.pageSize),
    );

    if (filters.startDate) {
        searchParams.set(
            "startDate",
            filters.startDate,
        );
    }

    if (filters.endDate) {
        searchParams.set(
            "endDate",
            filters.endDate,
        );
    }

    const response =
        await fetch(
            `/api/admin/attendance/student-report?${searchParams.toString()}`,
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
            "Failed to load student attendance report",
        );
    }

    return response.json();
}

export function useAttendanceStudentReport(
    filters: AttendanceStudentReportFilters,
    options?: Omit<
        UseQueryOptions<
            AttendanceStudentReportResponse,
            Error
        >,
        "queryKey" | "queryFn"
    >,
) {
    return useQuery({
        queryKey:
            attendanceQueryKeys.studentReport(
                filters,
            ),

        queryFn: () =>
            fetchAttendanceStudentReport(
                filters,
            ),

        enabled:
            !!filters.batchId &&
            !!filters.userId,

        placeholderData:
            (
                previousData,
            ) => previousData,

        staleTime:
            1000 * 60,

        gcTime:
            1000 * 60 * 5,

        ...options,
    });
}
