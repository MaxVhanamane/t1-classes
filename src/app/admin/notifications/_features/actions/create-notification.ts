"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { notificationSchema } from "../zod/notification.schema";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createNotification(data: unknown) {
    const parsed = notificationSchema.parse(data);

    const staff = await requireStaffServerOnly();



    const supabase = await createServerSupabaseClient();

    const payload = {
        title: parsed.title || null,
        message: parsed.message,
        type: parsed.type,
        batch_id: parsed.batch_id,
        created_by: staff.userId,
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
