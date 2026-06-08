"use client";

import { useQuery } from "@tanstack/react-query";

type CourseDetails = {
    id: string;

    title: string;

    class_level: number | null;

    target_exam: string | null;
};

async function fetchCourseDetails(
    courseId: string,
): Promise<CourseDetails> {
    const response =
        await fetch(
            `/api/admin/question-paper-course-attachments/${courseId}`,
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
            "Failed to load course details",
        );
    }

    return response.json();
}

export function useCourseDetails(
    courseId: string,
) {
    return useQuery({
        queryKey: [
            "course-details",
            courseId,
        ],

        queryFn: () =>
            fetchCourseDetails(
                courseId,
            ),

        enabled:
            Boolean(courseId),

        staleTime:
            1000 * 60 * 10,

        gcTime:
            1000 * 60 * 30,
    });
}
