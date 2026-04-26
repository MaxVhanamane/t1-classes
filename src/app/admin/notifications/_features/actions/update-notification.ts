"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { notificationSchema } from "../zod/notification.schema";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function updateNotification(
    id: string,
    data: unknown
) {
    const parsed = notificationSchema.parse(data);

    await requireStaffServerOnly();


    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("notifications")
        .update({
            title: parsed.title ?? null,
            message: parsed.message,
            type: parsed.type,
            batch_id: parsed.batch_id,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error("FAILED_TO_UPDATE_NOTIFICATION");
    }

    return { success: true };
}
