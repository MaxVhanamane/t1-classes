"use client";

import { useQuery } from "@tanstack/react-query";

import type { EnrollmentListResponse } from "../types/enrollments.types";
import type { EnrollmentFilters } from "../types/enrollment-filters";

async function fetchEnrollments(
    filters: EnrollmentFilters,
): Promise<EnrollmentListResponse> {
    const searchParams =
        new URLSearchParams();

    if (filters.search) {
        searchParams.set(
            "search",
            filters.search,
        );
    }

    searchParams.set(
        "active",
        filters.active,
    );

    searchParams.set(
        "targetType",
        filters.targetType,
    );

    searchParams.set(
        "enrollmentType",
        filters.enrollmentType,
    );

    searchParams.set(
        "registrationChannel",
        filters.registrationChannel,
    );

    searchParams.set(
        "feeStatus",
        filters.feeStatus,
    );

    searchParams.set(
        "feePlanRevision",
        filters.feePlanRevision,
    );

    searchParams.set(
        "access",
        filters.access,
    );

    if (filters.batchId) {
        searchParams.set(
            "batchId",
            filters.batchId,
        );
    }

    if (filters.courseId) {
        searchParams.set(
            "courseId",
            filters.courseId,
        );
    }

    searchParams.set(
        "page",
        String(filters.page),
    );

    const response =
        await fetch(
            `/api/admin/enrollments?${searchParams.toString()}`,
            {
                credentials:
                    "include",
            },
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load enrollments",
        );
    }

    return data;
}

export function useEnrollments(
    filters: EnrollmentFilters,
) {
    return useQuery({
        queryKey: [
            "admin",
            "enrollments",
            filters,
        ],

        queryFn: () =>
            fetchEnrollments(
                filters,
            ),

        placeholderData:
            filters.page > 1
                ? (
                    previousData,
                ) =>
                    previousData
                : undefined,

        refetchOnMount: 'always',

        staleTime:
            1000 * 60,

        gcTime:
            1000 *
            60 *
            30,
    });
}
