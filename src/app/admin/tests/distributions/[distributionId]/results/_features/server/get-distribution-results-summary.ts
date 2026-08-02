import "server-only";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { DistributionResultsSummary, DatabaseSummaryRow } from "../types/results.types";

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

    const row = data as DatabaseSummaryRow;

    return {
        testTitle: row.test_title,
        testType: row.test_type,
        totalMarks: Number(row.total_marks),
        totalQuestions: Number(row.total_questions),
        totalSections: Number(row.total_sections),
        batchId: row.batch_id,
        participants: Number(row.participants),
        submitted: Number(row.submitted),
        inProgress: Number(row.in_progress),
        expired: Number(row.expired),
        averageScore: row.average_score !== null ? Number(row.average_score) : null,
        topScore: row.top_score !== null ? Number(row.top_score) : null,
        sections: (row.section_details || []).map((sec) => ({
            sectionId: sec.section_id,
            subjectLabel: sec.subject_label,
            sectionTitle: sec.section_title,
            answerMode: sec.answer_mode,
            sectionTotalMarks: Number(sec.section_total_marks),
            sectionTotalQuestions: Number(sec.section_total_questions),
        })),
    };
}
