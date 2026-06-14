"use client";

import { useQuery } from "@tanstack/react-query";

import type { CourseRow } from "../types/course.types";
import type { CourseFilters } from "../types/course-filters";

type CoursesResponse = {
    items: CourseRow[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};

async function fetchCourses(
    filters: CourseFilters,
): Promise<CoursesResponse> {
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

    if (filters.category) {
        searchParams.set(
            "category",
            filters.category,
        );
    }

    if (filters.board) {
        searchParams.set(
            "board",
            filters.board,
        );
    }

    if (
        filters.classLevel !==
        null
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

    if (
        filters.instructorId
    ) {
        searchParams.set(
            "instructorId",
            filters.instructorId,
        );
    }

    searchParams.set(
        "page",
        String(filters.page),
    );

    const response =
        await fetch(
            `/api/admin/courses?${searchParams.toString()}`,
            {
                credentials:
                    "include",
            },
        );

    const data =
        await response.json();

    if (
        !response.ok
    ) {
        throw new Error(
            data.message ??
            "Failed to load courses",
        );
    }

    return data;
}

export function useCourses(
    filters: CourseFilters,
) {
    return useQuery({
        queryKey: [
            "admin",
            "courses",
            filters,
        ],

        queryFn: () =>
            fetchCourses(
                filters,
            ),

        placeholderData:
            filters.page > 1
                ? (
                    previousData,
                ) =>
                    previousData
                : undefined,

        staleTime:
            1000 * 60,

        gcTime:
            1000 *
            60 *
            30,
    });
}
