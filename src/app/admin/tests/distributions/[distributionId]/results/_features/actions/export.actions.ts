"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function fetchAllResultsForExport(distributionId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // Call the RPC that fetches ALL records without pagination
        const { data, error } = await supabase.rpc(
            "rpc_get_all_distribution_results_for_export",
            { p_distribution_id: distributionId }
        );

        if (error) {
            console.error("[EXPORT_RESULTS_RPC_ERROR]", error);
            throw new Error("Failed to fetch export data");
        }

        return { data, error: null };
    } catch (err) {
        console.error("[EXPORT_RESULTS_ACTION_ERROR]", err);
        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
