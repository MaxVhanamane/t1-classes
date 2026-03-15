import { z } from "zod";

export const scheduleTestSchema = z
    .object({
        test_id: z.uuid(),

        batch_id: z.uuid(),

        starts_at: z.iso.datetime({ offset: true }),

        ends_at: z.iso.datetime({ offset: true }),

        duration_minutes: z
            .number()
            .int()
            .min(1, "Duration must be at least 1 minute"),
    })
    .refine(
        (val) => new Date(val.ends_at) > new Date(val.starts_at),
        {
            message: "End time must be after start time",
            path: ["ends_at"],
        }
    );

export type ScheduleTestInput = z.infer<typeof scheduleTestSchema>;
