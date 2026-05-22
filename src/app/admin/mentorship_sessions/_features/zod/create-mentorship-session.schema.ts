import { z } from "zod";

export const createMentorshipSessionSchema =
    z
        .object({
            title: z
                .string()
                .trim()
                .min(3, "Title is required")
                .max(
                    120,
                    "Title is too long",
                ),

            description: z
                .string()
                .trim()
                .max(
                    1000,
                    "Description is too long",
                )
                .optional(),

            batch_id: z.uuid({
                message: "Select a batch",
            }),

            audience_type: z.enum([
                "batch",
                "selected_students",
            ]),

            student_ids: z.array(
                z.uuid(),
            ),

            duration_minutes: z.union([
                z.literal(15),
                z.literal(20),
                z.literal(25),
                z.literal(30),
            ]),

            starts_at: z.date({
                message:
                    "Select a session date and time",
            }),
        })

        .superRefine(
            (values, ctx) => {
                if (
                    values.audience_type ===
                    "selected_students" &&
                    values.student_ids.length === 0
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,

                        path: ["student_ids"],

                        message:
                            "Select at least one student",
                    });
                }
            },
        );

export type CreateMentorshipSessionSchema =
    z.infer<
        typeof createMentorshipSessionSchema
    >;
