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

    batch_id: z.uuid().nullable(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;
