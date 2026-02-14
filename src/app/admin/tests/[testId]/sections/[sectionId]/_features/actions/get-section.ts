"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import type { TestSection } from "../types/section.types"

export async function getSectionById(
    testId: string,
    sectionId: string
): Promise<TestSection> {
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
        .eq("id", sectionId)
        .eq("test_id", testId)
        .single()

    if (error || !data) {
        throw new Error("SECTION_NOT_FOUND")
    }

    return {
        id: data.id,
        testId: data.test_id,

        title: data.title,
        description: data.description,

        answerMode: data.answer_mode,

        fullMarks: Number(data.full_marks),
        negativeMarks: Number(data.negative_marks),
        partialMarks:
            (data.partial_marks as Record<number, number> | null) ??
            null,

        sortOrder: data.sort_order,

        subjectLabel: data.subject_label,
        scoringQuestionCount:
            data.scoring_question_count,
    }
}
