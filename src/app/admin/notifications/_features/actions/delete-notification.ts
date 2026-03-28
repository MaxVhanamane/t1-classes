"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";

export async function deleteNotification(id: string) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

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
