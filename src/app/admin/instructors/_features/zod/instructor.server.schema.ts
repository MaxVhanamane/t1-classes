import { z } from "zod";

/* ---------------------------------- */
/* Base Instructor Insert Schema      */
/* ---------------------------------- */

export const instructorInsertSchema = z.object({
    full_name: z.string().trim().min(1),
    email: z.string().trim().email().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    qualification: z.string().trim().min(1),
    bio: z.string().trim().min(1).max(600),
    profile_image: z.string().trim().optional().nullable(),
    is_active: z.boolean(),
});

/* ---------------------------------- */
/* Update Schema                      */
/* ---------------------------------- */

export const instructorUpdateSchema =
    instructorInsertSchema.partial();

/* ---------------------------------- */
/* Avatar Update Schema               */
/* ---------------------------------- */

export const instructorAvatarSchema = z.object({
    profile_image: z.string().trim().min(1),
});
