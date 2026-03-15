"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { revalidatePath } from "next/cache"
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role"
import { redirect } from "next/navigation"

export async function addTestSectionFromTemplate(
    testId: string,
    templateId: string,
    subjectLabel: string,
    scoringQuestionCount: number | null
) {
    const user = await getAuthIfHasRole(["admin", "teacher"])
    if (!user) redirect("/login")

    const supabase = await createServerSupabaseClient()

    /* -------------------------------------------- */
    /* Validate Subject */
    /* -------------------------------------------- */

    const cleanSubject = subjectLabel?.trim()

    if (!cleanSubject || cleanSubject.length < 2) {
        throw new Error("INVALID_SUBJECT_LABEL")
    }

    /* -------------------------------------------- */
    /* Validate Scoring Rule */
    /* -------------------------------------------- */

    if (
        scoringQuestionCount !== null &&
        (!Number.isInteger(scoringQuestionCount) || scoringQuestionCount < 1)
    ) {
        throw new Error("INVALID_SCORING_COUNT")
    }

    /* -------------------------------------------- */
    /* Fetch template + test lock in parallel */
    /* -------------------------------------------- */

    const [templateRes, testRes] = await Promise.all([
        supabase
            .from("test_section_templates")
            .select(`
        id,
        name,
        description,
        answer_mode,
        max_selections,
        default_full_marks,
        default_negative_marks,
        default_partial_marks
      `)
            .eq("id", templateId)
            .eq("is_active", true)
            .single(),

        supabase
            .from("tests")
            .select("is_locked, created_by")
            .eq("id", testId)
            .single(),
    ])

    const template = templateRes.data
    const test = testRes.data

    if (templateRes.error || !template) {
        throw new Error("TEMPLATE_NOT_FOUND")
    }

    if (testRes.error || !test) {
        throw new Error("TEST_NOT_FOUND")
    }

    /* -------------------------------------------- */
    /* Ownership check */
    /* -------------------------------------------- */

    if (user.role === "teacher" && test.created_by !== user.userId) {
        throw new Error("UNAUTHORIZED")
    }

    /* -------------------------------------------- */
    /* Lock check */
    /* -------------------------------------------- */

    if (test.is_locked) {
        throw new Error("TEST_LOCKED")
    }

    /* -------------------------------------------- */
    /* Compute next sort_order */
    /* -------------------------------------------- */

    const { data: lastSection } = await supabase
        .from("test_sections")
        .select("sort_order")
        .eq("test_id", testId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()

    const nextSortOrder = (lastSection?.sort_order ?? 0) + 1

    /* -------------------------------------------- */
    /* Insert section */
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
            negative_marks: template.default_negative_marks,
            partial_marks: template.default_partial_marks,
            sort_order: nextSortOrder,
            subject_label: cleanSubject,
            scoring_question_count: scoringQuestionCount,
        })

    if (insertError) {
        throw new Error(insertError.message)
    }

    /* -------------------------------------------- */
    /* Revalidate */
    /* -------------------------------------------- */

    revalidatePath(`/admin/tests/${testId}`)
}
