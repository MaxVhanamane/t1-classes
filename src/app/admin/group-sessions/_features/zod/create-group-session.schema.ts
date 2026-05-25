import { z } from "zod";

export const createGroupSessionSchema =
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

            expected_duration_minutes:
                z
                    .number()
                    .min(
                        5,
                        "Duration must be at least 5 minutes",
                    )
                    .max(
                        300,
                        "Duration is too long",
                    )
                    .nullable(),

            starts_at: z.date({
                message:
                    "Select a session date and time",
            }),

            meeting_link: z
                .string()
                .trim()
                .url(
                    "Enter a valid meeting link",
                )
                .optional()
                .or(z.literal("")),
        })

        .superRefine((values, ctx) => {
            /* ---------- Selected Students Validation ---------- */

            if (
                values.audience_type === "selected_students" &&
                values.student_ids.length === 0
            ) {
                ctx.addIssue({
                    code: "custom",

                    path: ["student_ids"],

                    message: "Select at least one student",
                });
            }

            /* ---------- Duration Validation ---------- */

            if (
                values.expected_duration_minutes &&
                values.expected_duration_minutes > 40
            ) {
                const totalParticipants =
                    values.audience_type === "batch"
                        ? 999
                        : values.student_ids.length + 1; // +1 for teacher

                if (totalParticipants >= 3) {
                    ctx.addIssue({
                        code: "custom",

                        path: [
                            "expected_duration_minutes",
                        ],

                        message:
                            "Sessions with 3 or more participants can run for a maximum of 40 minutes.",
                    });
                }
            }
        });

export type CreateGroupSessionSchema =
    z.infer<
        typeof createGroupSessionSchema
    >;
