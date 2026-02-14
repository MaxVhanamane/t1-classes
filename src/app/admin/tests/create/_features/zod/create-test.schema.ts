import { z } from "zod";

export const createTestSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(120, "Title is too long"),

    description: z
        .string()
        .max(500)
        .optional(),

    testType: z.enum(["standard", "sectioned"]),
});

export type CreateTestSchema = z.infer<typeof createTestSchema>;
