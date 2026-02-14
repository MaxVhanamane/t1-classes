"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { TestSection } from "../../types/test-section.types"

export async function getTestSections(
    testId: string
): Promise<TestSection[]> {
    const supabase = await createServerSupabaseClient()
    await getCurrentStaff()

    const { data, error } = await supabase
        .from("test_sections")
        .select(`
      id,
      test_id,
      title,
      description,
      answer_mode,
      full_marks,
      negative_marks,
      partial_marks,
      sort_order,
      subject_label,
      scoring_question_count
    `)
        .eq("test_id", testId)
        .order("sort_order", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return (
        data?.map((row) => ({
            id: row.id,
            testId: row.test_id,

            title: row.title,
            description: row.description,

            answerMode: row.answer_mode,

            fullMarks: Number(row.full_marks),
            negativeMarks: Number(row.negative_marks),
            partialMarks:
                (row.partial_marks as Record<number, number> | null) ??
                null,

            sortOrder: row.sort_order,

            subjectLabel: row.subject_label,
            scoringQuestionCount:
                row.scoring_question_count,
        })) ?? []
    )
}
