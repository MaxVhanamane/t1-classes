"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import { EnrollmentFeesData } from "../types/enrollment-fees-data.types";

async function fetchEnrollmentFees(
    enrollmentId: string
): Promise<EnrollmentFeesData> {
    return fetchWrapper<EnrollmentFeesData>(
        `/api/admin/enrollments/${enrollmentId}/fees`
    );
}

export function useEnrollmentFees(
    enrollmentId: string
) {
    return useQuery({
        queryKey: [
            "enrollment-fees",
            enrollmentId,
        ],

        queryFn: () =>
            fetchEnrollmentFees(
                enrollmentId
            ),

        enabled:
            !!enrollmentId,

        staleTime:
            1000 * 60 * 5, // 5 minutes

        gcTime:
            1000 * 60 * 10, // 10 minutes
    });
}
