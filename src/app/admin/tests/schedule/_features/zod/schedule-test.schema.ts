import { z } from "zod";

export const scheduleTestSchema = z
    .object({
        test_id: z.uuid(),

        audience: z.enum(["batch", "course", "marketing"]),

        batch_id: z.uuid().nullable(),
        course_id: z.uuid().nullable(),

        starts_at: z.iso.datetime({ offset: true }),
        ends_at: z.iso.datetime({ offset: true }),
        duration_minutes: z
            .number()
            .int()
            .min(1, "Duration must be at least 1 minute"),

        max_attempts: z
            .number()
            .int()
            .min(1, "Must allow at least 1 attempt"),
    })
    .refine(
        (val) => {
            if (val.audience === "batch") {
                return !!val.batch_id && !val.course_id;
            }
            if (val.audience === "course") {
                return !!val.course_id && !val.batch_id;
            }
            return !val.batch_id && !val.course_id;
        },
        {
            message:
                "Batch or Course must match the selected audience type",
            path: ["audience"],
        }
    )
    .refine(
        (val) => new Date(val.ends_at) > new Date(val.starts_at),
        {
            message: "End time must be after start time",
            path: ["ends_at"],
        }
    );

export type ScheduleTestInput = z.infer<typeof scheduleTestSchema>;
