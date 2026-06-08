"use client";

import { useQuery } from "@tanstack/react-query";
import { AttachmentFiltersType } from "../types/attachment-filters";
import { AttachmentTargetsResponse } from "../types/attachment-target";
import { questionPaperAttachmentQueryKeys } from "../constants/query-keys";



async function fetchCourses(
    filters: AttachmentFiltersType,
): Promise<AttachmentTargetsResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set(
        "page",
        String(filters.page),
    );

    searchParams.set(
        "pageSize",
        String(filters.pageSize),
    );

    if (
        filters.search.trim()
    ) {
        searchParams.set(
            "search",
            filters.search.trim(),
        );
    }

    if (
        filters.classLevel
    ) {
        searchParams.set(
            "classLevel",
            String(
                filters.classLevel,
            ),
        );
    }

    if (
        filters.targetExam
    ) {
        searchParams.set(
            "targetExam",
            filters.targetExam,
        );
    }

    const response =
        await fetch(
            `/api/admin/question-paper-attachments/courses?${searchParams.toString()}`,
            {
                credentials:
                    "include",
            },
        );

    if (
        !response.ok
    ) {
        const error =
            await response
                .json()
                .catch(
                    () => null,
                );

        throw new Error(
            error?.message ??
            "Failed to load courses",
        );
    }

    return response.json();
}

export function useCourses(
    filters: AttachmentFiltersType,
    enabled = true,
) {
    return useQuery({
        queryKey:
            questionPaperAttachmentQueryKeys.courseList(
                filters,
            ),

        queryFn: () =>
            fetchCourses(
                filters,
            ),
        enabled,
        staleTime:
            1000 * 60 * 5,

        gcTime:
            1000 * 60 * 10,


        placeholderData: (
            previousData,
        ) => previousData,
    });
}
