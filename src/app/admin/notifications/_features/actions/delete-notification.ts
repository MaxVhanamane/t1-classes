"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function deleteNotification(id: string) {
    await requireStaffServerOnly();


    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        throw new Error("FAILED_TO_DELETE_NOTIFICATION");
    }

    return { success: true };
}
