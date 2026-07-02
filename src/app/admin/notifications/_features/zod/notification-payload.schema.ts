import z from "zod";
import { notificationTypes } from "../types/notification.types";

// notification-payload.schema.ts
export const notificationPayloadSchema = z.object({
    title: z.string().trim().nullable(),

    message: z.string().trim().min(1).max(300),

    type: z.enum(notificationTypes),

    batch_id: z.string().uuid().nullable(),
});
