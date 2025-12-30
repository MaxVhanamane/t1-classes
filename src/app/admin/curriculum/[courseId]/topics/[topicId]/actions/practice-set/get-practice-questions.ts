"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function getPracticeQuestionsByPracticeSet(
    practiceSetId: string
) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("practice_questions")
        .select(`
      id,
      question,
      correct_answer_explanation,
      sort_order,
      practice_options (
        id,
        option_text,
        is_correct
      )
    `)
        .eq("practice_set_id", practiceSetId)
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
