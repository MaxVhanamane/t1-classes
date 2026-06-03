"use client";

import { useQuery } from "@tanstack/react-query";

import {
    AttendanceBatchReportResponse,
} from "../types/attendance";

import { attendanceQueryKeys } from "../constants/query-keys";

export type AttendanceBatchReportFilters =
    {
        batchId: string;

        search?: string;

        startDate?: string;

        endDate?: string;

        page: number;

        pageSize: number;
    };

async function fetchAttendanceBatchReport(
    filters: AttendanceBatchReportFilters,
): Promise<AttendanceBatchReportResponse> {
    const searchParams =
        new URLSearchParams();

    searchParams.set(
        "batchId",
        filters.batchId,
    );

    searchParams.set(
        "page",
        String(filters.page),
    );

    searchParams.set(
        "pageSize",
        String(filters.pageSize),
    );

    if (filters.search) {
        searchParams.set(
            "search",
            filters.search,
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

    const response =
        await fetch(
            `/api/admin/attendance/batch-report?${searchParams.toString()}`,
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
            "Failed to load batch attendance report",
        );
    }

    return response.json();
}

export function useAttendanceBatchReport(
    filters: AttendanceBatchReportFilters,
) {
    return useQuery({
        queryKey:
            attendanceQueryKeys.batchReport(
                filters,
            ),

        queryFn: () =>
            fetchAttendanceBatchReport(
                filters,
            ),

        enabled:
            !!filters.batchId,

        placeholderData: (
            previousData,
        ) => previousData,

        staleTime:
            1000 * 60,

        gcTime:
            1000 * 60 * 5,
    });
}
