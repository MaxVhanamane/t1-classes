import { z } from "zod";

/* -------------------------------------------- */
/* Base Schema (DB-aligned)                    */
/* -------------------------------------------- */

export const instructorSchema = z.object({
    id: z.string().optional(),

    full_name: z.string().trim().min(1, "Full name is required"),

    email: z.string().trim().email("Invalid email").optional().or(z.literal("")),

    phone: z.string().trim().optional().or(z.literal("")),

    qualification: z.string().trim().min(1, "Qualification is required"),

    bio: z
        .string()
        .trim()
        .min(1, "Bio is required")
        .max(600, "Bio must be under 600 characters"),

    profile_image: z.string().nullable().optional(),

    is_active: z.boolean(),
});

/* -------------------------------------------- */
/* Form Schema                                 */
/* -------------------------------------------- */

export const instructorFormSchema = instructorSchema.omit({
    id: true,
});

export type InstructorFormValues = z.infer<
    typeof instructorFormSchema
>;
