"use server";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import { notificationSchema } from "../zod/notification.schema";

export async function updateNotification(
    id: string,
    input: unknown,
): Promise<ServerActionResponse<void>> {
    // redirect() throws internally; don't wrap in try/catch
    await requireStaffServerOnly();

    try {
        /* ---------- validate ---------- */

        const parsed = notificationSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid notification data",
            };
        }

        const values = parsed.data;

        const supabase = await createServerSupabaseClient();

        /* ---------- update ---------- */

        const { error } = await supabase
            .from("notifications")
            .update({
                title: values.title ?? null,
                message: values.message,
                type: values.type,
                batch_id: values.batch_id,
            })
            .eq("id", id);

        if (error) {
            console.error("[UPDATE_NOTIFICATION_ERROR]", error);

            return {
                error: "Failed to update notification.",
            };
        }


    } catch (error) {
        console.error("[UPDATE_NOTIFICATION_FATAL]", error);

        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
