import { z } from "zod";

// 1. Base schema containing all the standard validation (allows past dates for editing)
export const baseGroupSessionSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(3, "Title is required")
            .max(120, "Title is too long"),

        description: z
            .string()
            .trim()
            .max(1000, "Description is too long")
            .optional(),

        batch_id: z.string().uuid({
            message: "Select a batch",
        }),

        audience_type: z.enum(["batch", "selected_students"]),

        student_ids: z.array(z.string().uuid()),

        expected_duration_minutes: z
            .number()
            .min(5, "Duration must be at least 5 minutes")
            .max(300, "Duration is too long")
            .nullable(),

        starts_at: z.date({
            message: "Select a session date and time",
        }),

        meeting_link: z.string()
            .url("Enter a valid Zoom meeting link")
            .optional()
            .or(z.literal("")),

        meeting_passcode: z
            .string()
            .trim()
            .max(100, "Passcode is too long")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
        /* ---------- Selected Students ---------- */
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

        /* ---------- Duration ---------- */
        if (
            values.expected_duration_minutes &&
            values.expected_duration_minutes > 40
        ) {
            const totalParticipants =
                values.audience_type === "batch"
                    ? 999
                    : values.student_ids.length + 1;

            if (totalParticipants >= 3) {
                ctx.addIssue({
                    code: "custom",
                    path: ["expected_duration_minutes"],
                    message: "Sessions with 3 or more participants can run for a maximum of 40 minutes.",
                });
            }
        }

        /* ---------- Meeting Fields ---------- */
        const hasMeetingLink = !!values.meeting_link;
        const hasMeetingPasscode = !!values.meeting_passcode;

        if (hasMeetingLink && !hasMeetingPasscode) {
            ctx.addIssue({
                code: "custom",
                path: ["meeting_passcode"],
                message: "Meeting passcode is required when a meeting link is added.",
            });
        }

        if (!hasMeetingLink && hasMeetingPasscode) {
            ctx.addIssue({
                code: "custom",
                path: ["meeting_link"],
                message: "Meeting link is required when a passcode is added.",
            });
        }
    });

// 2. Update Schema uses the base (allows past dates)
export const updateGroupSessionSchema = baseGroupSessionSchema;

// 3. Create Schema adds an extra check to ensure the date is in the future
export const createGroupSessionSchema = baseGroupSessionSchema.superRefine((values, ctx) => {
    if (values.starts_at < new Date()) {
        ctx.addIssue({
            code: "custom",
            path: ["starts_at"],
            message: "Session date and time must be in the future",
        });
    }
});

// Types
export type CreateGroupSessionSchema = z.infer<typeof createGroupSessionSchema>;
export type UpdateGroupSessionSchema = z.infer<typeof updateGroupSessionSchema>;
