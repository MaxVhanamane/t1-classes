"use client";

import { useQuery } from "@tanstack/react-query";
import { HomeworkChapterFilters, HomeworkChapterListResponse } from "../types/homework";
import { homeworkQueryKeys } from "../../[chapterId]/_features/constants/query-keys";

async function fetchHomeworkChapters(
    filters: HomeworkChapterFilters
): Promise<HomeworkChapterListResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(filters.page));

    if (filters.search.trim()) {
        searchParams.set("search", filters.search.trim());
    }
    if (filters.classLevel !== null) {
        searchParams.set("classLevel", String(filters.classLevel));
    }
    if (filters.subject) {
        searchParams.set("subject", filters.subject);
    }
    if (filters.targetExam) {
        searchParams.set("targetExam", filters.targetExam);
    }

    const response = await fetch(`/api/admin/homework-chapters?${searchParams.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? "Failed to load homework chapters");
    }

    return response.json();
}

export function useHomeworkChapters(filters: HomeworkChapterFilters) {
    // Unlike PDFs, there aren't tens of thousands of chapters, 
    // so we can safely fetch them on default without strictly requiring a filter first.
    return useQuery({
        queryKey: homeworkQueryKeys.chaptersList(filters.subject, filters.classLevel),
        queryFn: () => fetchHomeworkChapters(filters),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        placeholderData: (previousData) => previousData,
    });
}
