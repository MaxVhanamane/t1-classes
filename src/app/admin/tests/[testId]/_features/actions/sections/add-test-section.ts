"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { revalidatePath } from "next/cache"

export async function addTestSectionFromTemplate(
    testId: string,
    templateId: string,
    subjectLabel: string,
    scoringQuestionCount: number | null
) {
    const supabase = await createServerSupabaseClient()
    await getCurrentStaff()

    /* -------------------------------------------- */
    /* Validate Subject */
    /* -------------------------------------------- */

    if (!subjectLabel || subjectLabel.trim().length < 2) {
        throw new Error("INVALID_SUBJECT_LABEL")
    }

    const cleanSubject = subjectLabel.trim()

    /* -------------------------------------------- */
    /* Validate Scoring Rule */
    /* -------------------------------------------- */

    if (
        scoringQuestionCount !== null &&
        (!Number.isInteger(scoringQuestionCount) ||
            scoringQuestionCount < 1)
    ) {
        throw new Error("INVALID_SCORING_COUNT")
    }

    /* -------------------------------------------- */
    /* 1. Fetch template */
    /* -------------------------------------------- */

    const { data: template, error: templateError } =
        await supabase
            .from("test_section_templates")
            .select(
                `
        id,
        name,
        description,
        answer_mode,
        max_selections,
        default_full_marks,
        default_negative_marks,
        default_partial_marks
      `
            )
            .eq("id", templateId)
            .eq("is_active", true)
            .single()

    if (templateError || !template) {
        throw new Error("TEMPLATE_NOT_FOUND")
    }

    /* -------------------------------------------- */
    /* 2. Compute next sort_order */
    /* -------------------------------------------- */

    const { data: lastSection } = await supabase
        .from("test_sections")
        .select("sort_order")
        .eq("test_id", testId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()

    const nextSortOrder =
        (lastSection?.sort_order ?? 0) + 1

    /* -------------------------------------------- */
    /* 3. Create section */
    /* -------------------------------------------- */

    const { error: insertError } = await supabase
        .from("test_sections")
        .insert({
            test_id: testId,
            title: template.name,
            description: template.description,
            answer_mode: template.answer_mode,
            max_selections: template.max_selections,
            full_marks: template.default_full_marks,
            negative_marks:
                template.default_negative_marks,
            partial_marks:
                template.default_partial_marks,
            sort_order: nextSortOrder,

            subject_label: cleanSubject,
            scoring_question_count:
                scoringQuestionCount,
        })

    if (insertError) {
        throw new Error(insertError.message)
    }

    /* -------------------------------------------- */
    /* 4. Revalidate test builder */
    /* -------------------------------------------- */

    revalidatePath(`/admin/tests/${testId}`)
}
