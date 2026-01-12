import { z } from "zod";

const batchHighlightsSchema = z.object({
    sections: z
        .array(
            z.object({
                title: z
                    .string()
                    .min(1, "Highlight section title is required"),

                items: z
                    .array(
                        z.string().min(1, "Highlight item cannot be empty")
                    )
                    .min(1, "Each highlight section must have at least one item"),
            })
        )
        .min(1, "Add at least one batch highlight section"),
});


export const batchSchema = z
    .object({
        course_ids: z
            .array(z.uuid())
            .min(1, "Select at least one course"),

        name: z.string().min(1),
        description: z.string().max(500).nullable(),

        batch_highlights: batchHighlightsSchema.nullable(),

        price: z.number().min(0),

        mode: z.enum(["offline", "online", "hybrid"]),
        status: z.enum([
            "upcoming",
            "ongoing",
            "completed",
            "cancelled",
        ]),

        is_active: z.boolean(),
        admission_open: z.boolean(),

        languages: z.array(z.string()).min(1),
        center_name: z.string().nullable(),

        start_date: z.string().nullable(),
        end_date: z.string().nullable(),
        duration: z.number().int().positive().nullable(),

        schedule: z.string().nullable(),
        meeting_link: z.url().nullable(),
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
