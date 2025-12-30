import { z } from "zod";

/**
 * Client form schema
 * - Only user-editable fields
 */
export const addChapterFormSchema = z.object({
    title: z
        .string()
        .min(1, "Chapter title is required")
        .max(150, "Chapter title is too long"),
});

/**
 * Client form input type
 */
export type AddChapterFormInput = z.infer<
    typeof addChapterFormSchema
>;


export const toggleChapterPublishSchema = z.object({
    courseId: z.uuid(),
    chapterId: z.uuid(),
    publish: z.boolean(),
});

export type ToggleChapterPublishInput = z.infer<
    typeof toggleChapterPublishSchema
>;
