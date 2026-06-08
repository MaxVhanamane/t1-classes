"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseQuestionPaperAttachmentQueryKeys } from "./constants/query-keys";


type Variables = {
    questionPaperIds: string[];
};

async function attachCourseQuestionPapers(
    courseId: string,
    variables: Variables,
) {
    const response = await fetch(
        `/api/admin/question-paper-course-attachments/${courseId}/attach-question-papers`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(
                variables,
            ),
        },
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ??
            "Failed to attach question papers.",
        );
    }

    return data;
}

export function useAttachCourseQuestionPapers(
    courseId: string,
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            variables: Variables,
        ) =>
            attachCourseQuestionPapers(
                courseId,
                variables,
            ),

        onSuccess: () => {
            void queryClient.invalidateQueries(
                {
                    queryKey:
                        courseQuestionPaperAttachmentQueryKeys.questionPapers(
                            courseId,
                        ),
                },
            );

            void queryClient.invalidateQueries(
                {
                    queryKey: [
                        "course-question-paper-attachment",
                        "available-question-papers",
                        courseId,
                    ],
                },
            );
        },
    });
}
