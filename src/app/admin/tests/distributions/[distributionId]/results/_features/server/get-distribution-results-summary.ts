import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { DistributionResultsSummary } from "../types/results.types";

type DistributionResultsSummaryRow = {
    test_title: string;
    participants: number;
    submitted: number;
    in_progress: number;
    expired: number;
    average_score: number | null;
    top_score: number | null;
};
export async function getDistributionResultsSummary(
    distributionId: string,
): Promise<DistributionResultsSummary> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .rpc("distribution_results_summary", {
            d_id: distributionId,
        })
        .single();

    if (error || !data) {
        console.error("[RESULTS_SUMMARY]", error);

        throw new Error("FAILED_TO_LOAD_RESULTS");
    }

    const row = data as DistributionResultsSummaryRow;

    return {
        testTitle: row.test_title,
        participants: Number(row.participants),

        submitted: Number(row.submitted),

        inProgress: Number(row.in_progress),

        expired: Number(row.expired),

        averageScore:
            row.average_score !== null
                ? Number(row.average_score)
                : null,

        topScore:
            row.top_score !== null
                ? Number(row.top_score)
                : null,
    };
}
