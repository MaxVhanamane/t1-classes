import { z } from "zod";

export const practiceSetSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title is too long"),

    description: z
        .string()
        .optional()
        .nullable(),
});

export type PracticeSetInput = z.infer<typeof practiceSetSchema>;


export const updatePracticeSetSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable(),
});

export type UpdatePracticeSetInput = z.infer<
    typeof updatePracticeSetSchema
>;


export const deletePracticeSetSchema = z.object({
    courseId: z.uuid(),
    topicId: z.uuid(),
    practiceSetId: z.uuid(),
});

export type DeletePracticeSetInput = z.infer<
    typeof deletePracticeSetSchema
>;
