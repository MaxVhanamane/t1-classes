"use client";

import {
    useQuery,
    UseQueryOptions,
} from "@tanstack/react-query";

import {
    AttendanceHistoryFilters,
    AttendanceHistoryResponse,
} from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

async function fetchAttendanceHistory(
    filters: AttendanceHistoryFilters,
): Promise<AttendanceHistoryResponse> {
    const searchParams =
        new URLSearchParams();

    if (filters.batchId) {
        searchParams.set(
            "batchId",
            filters.batchId,
        );
    }
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


    searchParams.set(
        "page",
        String(filters.page),
    );

    searchParams.set(
        "pageSize",
        String(filters.pageSize),
    );

    const response =
        await fetch(
            `/api/admin/attendance/history?${searchParams.toString()}`,
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
            "Failed to load attendance history",
        );
    }

    return response.json();
}

export function useAttendanceHistory(
    filters: AttendanceHistoryFilters,
    options?: Omit<
        UseQueryOptions<
            AttendanceHistoryResponse,
            Error
        >,
        "queryKey" | "queryFn"
    >,
) {
    return useQuery({
        queryKey:
            attendanceQueryKeys.history(
                filters,
            ),

        queryFn: () =>
            fetchAttendanceHistory(
                filters,
            ),

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
