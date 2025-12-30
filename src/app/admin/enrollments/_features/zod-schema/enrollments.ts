import { z } from "zod";

export const createEnrollmentSchema = z
    .object({
        user_id: z.uuid(),

        target_type: z.enum(["batch", "course"]),
        batch_id: z.uuid().optional(),
        course_id: z.uuid().optional(),

        registration_channel: z.enum(["online", "offline"]),
        enrollment_type: z.enum(["paid", "scholarship", "trial", "internal"]),
        status: z.enum(["ongoing", "paused", "completed", "cancelled"]),

        is_active: z.boolean().optional(),

        access_starts_at: z.string(),
        access_ends_at: z.string().optional(),

        notes: z.string().optional(),
    })
    .refine(
        (d) =>
            (d.target_type === "batch" && d.batch_id && !d.course_id) ||
            (d.target_type === "course" && d.course_id && !d.batch_id),
        {
            path: ["target_type"],
            message: "Invalid target configuration",
        }
    );

export type CreateEnrollmentInput = z.infer<
    typeof createEnrollmentSchema
>;
