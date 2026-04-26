import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import type { TestSection } from "../types/section.types"
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only"

type SectionWithTest = {
    id: string
    test_id: string
    title: string
    description: string | null
    answer_mode: string
    full_marks: number
    negative_marks: number
    partial_marks: Record<number, number> | null
    sort_order: number
    subject_label: string
    scoring_question_count: number | null
    tests: {
        is_locked: boolean
    }
}

export async function getSectionById(
    testId: string,
    sectionId: string
): Promise<TestSection> {
    const supabase = await createServerSupabaseClient()
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireStaffServerOnly();


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
    scoring_question_count,
    tests (
      is_locked
    )
  `)
        .eq("id", sectionId)
        .eq("test_id", testId)
        .single<SectionWithTest>()

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
        is_locked: data.tests.is_locked,
    }
}
