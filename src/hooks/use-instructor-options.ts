"use client";

import { useQuery } from "@tanstack/react-query";

import type { InstructorSelectItem } from "@/src/app/admin/batches/_features/types/types";

async function fetchInstructorOptions(): Promise<
    InstructorSelectItem[]
> {
    const response = await fetch(
        "/api/admin/options/instructors",
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to load instructors",
        );
    }

    return data;
}

export function useInstructorOptions() {
    return useQuery({
        queryKey: [
            "instructor-options",
        ],

        queryFn:
            fetchInstructorOptions,

        staleTime:
            1000 * 60 * 30,

        gcTime:
            1000 * 60 * 60,
    });
}
