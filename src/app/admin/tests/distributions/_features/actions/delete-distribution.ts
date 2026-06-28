"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function deleteDistribution(
    distributionId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        // Deletes distribution and unlocks test if no other distribution exists
        const { error } = await supabase.rpc(
            "rpc_delete_test_distribution",
            {
                p_distribution_id: distributionId,
            }
        );

        if (error) {
            console.error("[DELETE_DISTRIBUTION_ERROR]", error);
            return {
                error:
                    error.message ||
                    "Failed to delete distribution. Please try again.",
            };
        }

        // No return on success
    } catch (err) {
        console.error("[DELETE_DISTRIBUTION_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
