"use server";

import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteNotification(
    id: string,
): Promise<ServerActionResponse<void>> {
    // redirect() throws internally; don't wrap in try/catch
    await requireStaffServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("[DELETE_NOTIFICATION_ERROR]", error);

            return {
                error: "Failed to delete notification.",
            };
        }

    } catch (error) {
        console.error("[DELETE_NOTIFICATION_FATAL]", error);

        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
