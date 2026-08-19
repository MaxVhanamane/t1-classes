"use client";

import { useQuery } from "@tanstack/react-query";

import {
    HomeworkMaterialFilters,
    HomeworkMaterialListResponse,
} from "../types/homework";

import { homeworkQueryKeys } from "../constants/query-keys";

async function fetchHomeworkMaterials(
    filters: HomeworkMaterialFilters
): Promise<HomeworkMaterialListResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(filters.page));

    if (filters.search.trim()) {
        searchParams.set("search", filters.search.trim());
    }

    if (filters.targetExam) {
        searchParams.set("targetExam", filters.targetExam);
    }

    if (filters.classLevel !== null) {
        searchParams.set("classLevel", String(filters.classLevel));
    }

    if (filters.subject) {
        searchParams.set("subject", filters.subject);
    }

    if (filters.chapterId) {
        searchParams.set("chapterId", filters.chapterId);
    }

    if (filters.homeworkType) {
        searchParams.set("homeworkType", filters.homeworkType);
    }

    if (filters.difficulty) {
        searchParams.set("difficulty", filters.difficulty);
    }

    const response = await fetch(
        `/api/admin/homework-materials?${searchParams.toString()}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
            error?.message ?? "Failed to load homework materials"
        );
    }

    return response.json();
}

export function useHomeworkMaterials(filters: HomeworkMaterialFilters) {
    const hasActiveFilters = Boolean(
        filters.search ||
        filters.classLevel ||
        filters.subject ||
        filters.targetExam ||
        filters.chapterId ||
        filters.homeworkType ||
        filters.difficulty
    );
    return useQuery({
        queryKey: homeworkQueryKeys.list(filters),

        queryFn: () => fetchHomeworkMaterials(filters),
        // Prevent fetching on initial load if no filters are selected
        enabled: hasActiveFilters,
        staleTime: 1000 * 60 * 5,

        gcTime: 1000 * 60 * 10,

        placeholderData: (previousData) => previousData,
    });
}
