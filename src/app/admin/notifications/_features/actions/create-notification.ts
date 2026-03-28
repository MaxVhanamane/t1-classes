"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { notificationSchema } from "../zod/notification.schema";

export async function createNotification(data: unknown) {
    const parsed = notificationSchema.parse(data);

    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    const supabase = await createServerSupabaseClient();

    const payload = {
        title: parsed.title || null,
        message: parsed.message,
        type: parsed.type,
        batch_id: parsed.batch_id,
        created_by: user.userId,
    };

    const { error } = await supabase
        .from("notifications")
        .insert(payload);

    if (error) {
        console.error(error);
        throw new Error("FAILED_TO_CREATE_NOTIFICATION");
    }

    return { success: true };
}
