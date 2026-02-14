"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { DistributionResultsSummary } from "../types/results.types"

export async function getDistributionResultsSummary(
    distributionId: string
): Promise<DistributionResultsSummary> {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    /* ---------------------------------- */
    /* Role protection */
    /* ---------------------------------- */

    if (staff.role !== "admin") {
        const { data, error } = await supabase
            .from("test_distributions")
            .select("id")
            .eq("id", distributionId)
            .eq("created_by", staff.id)
            .maybeSingle()

        if (error || !data) {
            throw new Error("NOT_AUTHORIZED")
        }
    }

    /* ---------------------------------- */
    /* Assigned / Submitted */
    /* ---------------------------------- */

    const { data: attempts, error: attemptsError } =
        await supabase
            .from("test_attempts")
            .select("status", { count: "exact" })
            .eq("distribution_id", distributionId)

    if (attemptsError) {
        console.error("[RESULTS_ATTEMPTS]", attemptsError)
        throw new Error("FAILED_TO_LOAD_RESULTS")
    }

    const participants = attempts?.length ?? 0
    const submitted =
        attempts?.filter((a) => a.status === "submitted")
            .length ?? 0

    /* ---------------------------------- */
    /* Scores */
    /* ---------------------------------- */

    const { data: results, error: resultsError } =
        await supabase
            .from("test_results")
            .select("obtained_marks")
            .eq("distribution_id", distributionId)

    if (resultsError) {
        console.error("[RESULTS_SCORES]", resultsError)
        throw new Error("FAILED_TO_LOAD_RESULTS")
    }

    let averageScore: number | null = null
    let topScore: number | null = null

    if (results && results.length > 0) {
        const scores = results.map((r) =>
            Number(r.obtained_marks)
        )

        const total = scores.reduce((a, b) => a + b, 0)
        averageScore = Number(
            (total / scores.length).toFixed(2)
        )

        topScore = Math.max(...scores)
    }

    return {
        participants,
        submitted,
        averageScore,
        topScore,
    }
}
