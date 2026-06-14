import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import type { TestQuestion } from "../types/question.types";

const PAGE_SIZE = 10;

export type PaginatedQuestionsResponse = {
    items: TestQuestion[];

    total: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export async function getQuestionsForSection(
    sectionId: string,
    page: number = 1,
): Promise<PaginatedQuestionsResponse> {
    const supabase = await createServerSupabaseClient();

    const from = (page - 1) * PAGE_SIZE;

    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
        .from("test_questions")
        .select(
            `
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
      `,
            {
                count: "exact",
            },
        )
        .eq("section_id", sectionId)
        .order("sort_order", {
            ascending: true,
        })
        .order("sort_order", {
            referencedTable: "test_question_options",
            ascending: true,
        })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        items:
            data?.map((question) => ({
                id: question.id,

                questionText: question.question_text,

                explanation: question.explanation,

                correctAnswer: question.correct_answer,

                options:
                    question.test_question_options?.map((option) => ({
                        id: option.id,

                        label: option.option_label,

                        text: option.option_text,
                    })) ?? [],
            })) ?? [],

        total: count ?? 0,

        page,

        pageSize: PAGE_SIZE,

        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    };
}
