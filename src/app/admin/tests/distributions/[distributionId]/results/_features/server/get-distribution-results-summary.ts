import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { DistributionResultsSummary } from "../types/results.types"
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only"

type DistributionResultsSummaryRow = {
    participants: number
    submitted: number
    in_progress: number
    expired: number
    average_score: number | null
    top_score: number | null
}

export async function getDistributionResultsSummary(
    distributionId: string
): Promise<DistributionResultsSummary> {

    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient()

    /* ---------------------------------- */
    /* Role protection */
    /* ---------------------------------- */

    if (staff.role !== "admin") {
        const { data, error } = await supabase
            .from("test_distributions")
            .select("id")
            .eq("id", distributionId)
            .eq("created_by", staff.userId)
            .maybeSingle()

        if (error || !data) {
            throw new Error("NOT_AUTHORIZED")
        }
    }

    /* ---------------------------------- */
    /* Summary RPC */
    /* ---------------------------------- */

    const { data, error } = await supabase
        .rpc("distribution_results_summary", { d_id: distributionId })
        .single()

    if (error || !data) {
        console.error("[RESULTS_SUMMARY]", error)
        throw new Error("FAILED_TO_LOAD_RESULTS")
    }

    const row = data as DistributionResultsSummaryRow

    return {
        participants: Number(row.participants),
        submitted: Number(row.submitted),
        inProgress: Number(row.in_progress),
        expired: Number(row.expired),
        averageScore: row.average_score,
        topScore: row.top_score,
    }
}
