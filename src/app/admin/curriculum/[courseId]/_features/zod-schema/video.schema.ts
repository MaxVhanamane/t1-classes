import { z } from "zod";

export const addVideoFormSchema = z.object({
    title: z.string().min(1, "Title is required"),

    description: z.string().optional(),

    contentUrl: z.url({
        message: "Enter a valid URL",
    }),
    videoProvider: z.enum(["youtube", "vimeo"]),
    durationMinutes: z
        .string()
        .optional()
        .refine(
            (val) => !val || !isNaN(Number(val)),
            "Duration must be a number"
        ),
    isFreePreview: z.boolean(), // no default
});

export type AddVideoFormInput = z.infer<typeof addVideoFormSchema>;

