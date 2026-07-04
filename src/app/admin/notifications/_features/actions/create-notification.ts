"use server";

import { after } from "next/server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { sendPushNotification } from "@/src/lib/firebase/send-push-notification";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";

import { notificationPayloadSchema } from "../zod/notification-payload.schema";

export async function createNotification(
    input: unknown,
): Promise<ServerActionResponse<void>> {
    // Don't wrap this in try/catch because redirect() throws internally.
    const staff = await requireStaffServerOnly();

    try {
        /* ---------- validate ---------- */

        const parsed = notificationPayloadSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid notification data",
            };
        }

        const values = parsed.data;

        const supabase = await createServerSupabaseClient();

        /* ---------- create notification ---------- */

        const payload = {
            title: values.title || null,
            message: values.message,
            type: values.type,
            batch_id: values.batch_id,
            created_by: staff.userId,
        };

        const { data: notification, error } = await supabase
            .from("notifications")
            .insert(payload)
            .select("id")
            .single();

        if (error || !notification) {
            console.error(
                "[CREATE_NOTIFICATION_ERROR]",
                error,
            );

            return {
                error: "Failed to create notification.",
            };
        }

        /* ---------- send push after response ---------- */

        after(async () => {
            try {
                const result = await sendPushNotification({
                    title: payload.title ?? "Notification",
                    body: payload.message,
                    type: payload.type,

                    audience: payload.batch_id
                        ? {
                            type: "batch",
                            batchId: payload.batch_id,
                        }
                        : {
                            type: "all",
                        },

                    tag: notification.id,

                    data: {
                        notificationId: notification.id,
                    },
                });

                console.log(
                    "[CREATE_NOTIFICATION_PUSH]",
                    result,
                );
            } catch (error) {
                // Push notifications are complementary.
                // The notification already exists, so never fail
                // because push delivery failed.
                console.error(
                    "[CREATE_NOTIFICATION_PUSH_ERROR]",
                    error,
                );
            }
        });

        return {
            data: undefined,
        };
    } catch (error) {
        console.error(
            "[CREATE_NOTIFICATION_FATAL]",
            error,
        );

        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
