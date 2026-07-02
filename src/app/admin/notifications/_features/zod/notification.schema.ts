import { z } from "zod";

import { notificationTypes } from "../types/notification.types";


export const notificationSchema = z.object({
    title: z.string().trim().nullable(),

    message: z
        .string({ error: "Message is required" })
        .trim()
        .min(1, "Message is required")
        .max(300, "Message must be under 300 characters"),

    type: z.enum(notificationTypes, {
        error: "Please select a notification type",
    }),
    // "" = no selection yet
    // "all" = all students
    // uuid = batch id
    batch_id: z
        .string({ error: "Please select a target" })
        .min(1, "Please select a target"),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;
