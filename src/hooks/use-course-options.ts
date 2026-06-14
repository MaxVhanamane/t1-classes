"use client";

import { useQuery } from "@tanstack/react-query";

import type { CourseSelectItem } from "@/src/app/admin/batches/_features/types/types";

async function fetchCourseOptions(): Promise<
    CourseSelectItem[]
> {
    const response = await fetch(
        "/api/admin/options/courses",
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load courses",
        );
    }

    return data;
}

export function useCourseOptions() {
    return useQuery({
        queryKey: [
            "course-options",
        ],

        queryFn:
            fetchCourseOptions,

        staleTime:
            1000 * 60 * 30,

        gcTime:
            1000 * 60 * 60,
    });
}
