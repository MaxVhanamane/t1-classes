import { z } from "zod";

import { notificationTypes } from "../types/notification.types";

export const notificationSchema = z.object({
    title: z.string().trim().nullable(),

    message: z
        .string()
        .trim()
        .min(1, "Message is required")
        .max(300, "Message must be under 300 characters"),

    type: z.enum(notificationTypes),

    // "" = no selection yet
    // "all" = all students
    // uuid = batch id
    batch_id: z.string(),
});

export type NotificationFormValues =
    z.infer<typeof notificationSchema>;
