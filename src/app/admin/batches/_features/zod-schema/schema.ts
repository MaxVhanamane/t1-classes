import { z } from "zod";

export const batchSchema = z
    .object({
        course_id: z.string().uuid(),
        name: z.string().min(1),

        mode: z.enum(["offline", "online", "hybrid"]),
        status: z.enum([
            "upcoming",
            "ongoing",
            "completed",
            "cancelled",
        ]),
        is_active: z.boolean(),
        languages: z.array(z.string()).min(1),
        center_name: z.string().nullable(),
        admission_open: z.boolean(),
        description: z.string().max(500).nullable(),
        start_date: z.string().nullable(),
        end_date: z.string().nullable(),
        duration: z.number().int().positive().nullable(),

        schedule: z.string().nullable(),
        meeting_link: z.string().url().nullable(),
        capacity: z.number().int().positive().nullable(),
    })
    .refine(
        (data) => {
            const hasDates = !!data.start_date || !!data.end_date;
            const hasDuration = !!data.duration;
            return hasDates !== hasDuration;
        },
        {
            message:
                "Provide either start/end dates OR duration (months)",
            path: ["duration"],
        }
    )
    .refine(
        (data) =>
            data.mode === "offline" || !!data.meeting_link,
        {
            message:
                "Meeting link required for online or hybrid batches",
            path: ["meeting_link"],
        }
    );
