"use client";

import { useQuery } from "@tanstack/react-query";

import type { BatchListItem } from "../types/types";
import type { BatchFilters } from "../types/batch-filters";

type BatchesResponse = {
    items: BatchListItem[];

    page: number;

    total: number;

    totalPages: number;

    pageSize: number;
};

async function fetchBatches(
    filters: BatchFilters,
): Promise<BatchesResponse> {
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

    if (filters.lifecycle) {
        searchParams.set(
            "lifecycle",
            filters.lifecycle,
        );
    }

    if (filters.admission) {
        searchParams.set(
            "admission",
            filters.admission,
        );
    }

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

    if (filters.mode) {
        searchParams.set(
            "mode",
            filters.mode,
        );
    }

    if (filters.classLevel) {
        searchParams.set(
            "classLevel",
            String(
                filters.classLevel,
            ),
        );
    }

    if (filters.targetExam) {
        searchParams.set(
            "targetExam",
            filters.targetExam,
        );
    }

    if (filters.courseId) {
        searchParams.set(
            "courseId",
            filters.courseId,
        );
    }

    if (filters.instructorId) {
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
            `/api/admin/batches?${searchParams.toString()}`,
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
            "Failed to load batches",
        );
    }

    return data;
}

export function useBatches(
    filters: BatchFilters,
) {
    return useQuery({
        queryKey: [
            "admin",
            "batches",
            filters,
        ],

        queryFn: () =>
            fetchBatches(
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
