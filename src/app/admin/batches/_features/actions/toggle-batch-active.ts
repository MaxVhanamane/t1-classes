"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function toggleBatchActive(
    batchId: string,
    isActive: boolean
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireAdminServerOnly();
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("batches")
            .update({
                is_active: isActive,
                updated_by: staff.userId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", batchId);

        if (error) {
            console.error("[TOGGLE_BATCH_ACTIVE_ERROR]", error);
            return {
                error: "Failed to update batch status. Please try again.",
            };
        }

    } catch (err) {
        console.error("[TOGGLE_BATCH_ACTIVE_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
