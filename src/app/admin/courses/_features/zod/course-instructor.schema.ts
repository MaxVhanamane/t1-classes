import { z } from "zod";

/* -------------------------------------------- */
/* Single instructor                           */
/* -------------------------------------------- */

export const instructorSchema = z.object({
    id: z.uuid().optional(),
    course_id: z.uuid(),

    name: z
        .string()
        .trim()
        .min(1, "Instructor name is required"),

    qualification: z
        .string()
        .trim()
        .min(1, "Qualification is required"),

    bio: z
        .string()
        .trim()
        .min(1, "Bio is required")
        .max(600, "Bio must be under 600 characters"),

    avatar_url: z
        .string()
        .nullable()
        .optional(),
});

/* -------------------------------------------- */
/* Form schema (UI only)                       */
/* -------------------------------------------- */

export const instructorsFormSchema = z.object({
    instructors: z
        .array(
            instructorSchema.omit({
                course_id: true, // UI does not send this
            })
        )
        .min(1, "At least one instructor is required"),
});

export type InstructorsFormValues =
    z.infer<typeof instructorsFormSchema>;
