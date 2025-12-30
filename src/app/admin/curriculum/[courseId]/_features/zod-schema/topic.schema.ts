import { z } from "zod";

export const addTopicFormSchema = z.object({
    title: z
        .string()
        .min(1, "Topic title is required")
        .max(200, "Topic title is too long"),
});

export type AddTopicFormInput = z.infer<typeof addTopicFormSchema>;
