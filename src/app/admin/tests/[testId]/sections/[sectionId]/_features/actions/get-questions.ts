"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import type { TestQuestion } from "../types/question.types"

export async function getQuestionsForSection(
    sectionId: string
): Promise<TestQuestion[]> {
    const supabase = await createServerSupabaseClient()
    await getCurrentStaff()

    const { data, error } = await supabase
        .from("test_questions")
        .select(`
      id,
      question_text,
      explanation,
      correct_answer,
      test_question_options (
        id,
        option_label,
        option_text,
        sort_order
      )
    `)
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: true })
        .order("sort_order", {
            referencedTable: "test_question_options",
            ascending: true,
        })

    if (error) throw error

    return (
        data?.map((q) => ({
            id: q.id,
            questionText: q.question_text,
            explanation: q.explanation,
            correctAnswer: q.correct_answer,
            options:
                q.test_question_options?.map((o) => ({
                    id: o.id,
                    label: o.option_label,
                    text: o.option_text,
                })) ?? [],
        })) ?? []
    )
}
