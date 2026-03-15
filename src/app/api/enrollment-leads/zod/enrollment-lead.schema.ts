import { z } from "zod";

export const enrollmentLeadSchema = z
    .object({
        course_id: z.uuid().optional().nullable(),
        batch_id: z.uuid().optional().nullable(),

        name: z.string().trim().min(2, "Name is required"),
        phone: z.string().trim().min(6, "Phone is required"),
        email: z.email().optional().nullable(),
        message: z
            .string()
            .max(300, "Message cannot exceed 300 characters")
            .optional()
            .nullable(),
        captchaToken: z.string(),
        website: z.string().optional(),
    })
    .refine(
        (data) =>
            (data.course_id && !data.batch_id) ||
            (!data.course_id && data.batch_id),
        {
            message: "Either course_id or batch_id must be provided",
        },
    );

export type EnrollmentLeadInput = z.infer<
    typeof enrollmentLeadSchema
>;
