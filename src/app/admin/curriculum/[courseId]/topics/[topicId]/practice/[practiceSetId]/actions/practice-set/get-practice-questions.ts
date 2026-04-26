import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { PracticeQuestion, PracticeQuestionOption } from "../../../../types/practice-question.types";

export async function getPracticeQuestionsByPracticeSet(
    practiceSetId: string
): Promise<PracticeQuestion[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("practice_questions")
        .select(
            `
      id,
      question,
      explanation,
      correct_answer,
      answer_mode,
      sort_order,
      practice_question_options (
        id,
        option_label,
        option_text,
        sort_order
      )
    `
        )
        .eq("practice_set_id", practiceSetId)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
    }

    // Ensure options are sorted correctly
    const formattedData: PracticeQuestion[] = (data ?? []).map((q) => ({
        ...q,
        practice_question_options: (
            q.practice_question_options ?? []
        ).sort(
            (a: PracticeQuestionOption, b: PracticeQuestionOption) =>
                a.sort_order - b.sort_order
        ),
    }));

    return formattedData;
}
