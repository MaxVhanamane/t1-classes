import { z } from "zod";
import { SUBJECTS, TARGET_EXAMS } from "@/src/app/admin/batches/_features/zod-schema/schema";

export const homeworkChapterSchema = z.object({
    class_level: z
        .number()
        .min(1)
        .max(12)
        .nullable()
        .optional(),

    subject: z.enum(SUBJECTS, {
        message: "Please select a valid subject",
    }),

    target_exam: z.enum(TARGET_EXAMS).nullable().optional(),

    // FIX: Replaced 'required_error' and 'invalid_type_error' with just 'message'
    chapter_number: z
        .number({
            message: "Chapter number is required and must be a valid number",
        })
        .int({ message: "Must be a whole number" })
        .positive({ message: "Must be greater than 0" }),

    chapter_name: z
        .string()
        .min(2, { message: "Chapter name must be at least 2 characters" })
        .max(255, { message: "Chapter name is too long" }),
});

export type HomeworkChapterFormValues = z.infer<typeof homeworkChapterSchema>;
