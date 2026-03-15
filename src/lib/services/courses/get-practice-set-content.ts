"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCourseAccess } from "./course-access";

export type PracticeSetContent = {
    id: string
    title: string
    description: string | null
    questions: {
        id: string
        question: string
        explanation: string | null
        options: {
            id: string
            optionText: string
            isCorrect: boolean
        }[]
    }[]
}


type PracticeSetWithCourse = {
    id: string;
    title: string;
    description: string | null;
    is_published: boolean;
    is_free_preview: boolean;
    topic: {
        course_id: string;
    } | null;
};


export async function getPracticeSetContent(practiceSetId: string): Promise<PracticeSetContent> {
    const supabase = await createServerSupabaseClient();

    // -------------------------------------------------
    // 1. Fetch practice set + resolve course
    // -------------------------------------------------
    const { data: ps, error: psError } = await supabase
        .from("practice_sets")
        .select(
            `
        id,
        title,
        description,
        is_published,
        is_free_preview,
        topic:topic_id (
          course_id
        )
      `
        )
        .eq("id", practiceSetId)
        .single()
        .overrideTypes<PracticeSetWithCourse>();



    if (psError || !ps) {
        throw new Error("Practice set not found");
    }

    if (!ps.is_published) {
        throw new Error("Practice set not published");
    }
    if (!ps.topic) {
        throw new Error("Invalid practice set topic mapping");
    }

    const courseId = ps.topic.course_id;



    // -------------------------------------------------
    // 2. Access check
    // -------------------------------------------------
    const access = await getCourseAccess(courseId);
    const canAccess = access.hasAccess || ps.is_free_preview === true;


    if (!canAccess) {
        throw new Error("You do not have access to this content");
    }

    // -------------------------------------------------
    // 3. Fetch questions + options (WITH answers)
    // -------------------------------------------------
    const { data: questions, error: qError } = await supabase
        .from("practice_questions")
        .select(
            `
        id,
        question,
        correct_answer_explanation,
        sort_order,
        options:practice_options (
          id,
          option_text,
          is_correct
        )
      `
        )
        .eq("practice_set_id", practiceSetId)
        .order("sort_order");

    if (qError || !questions) {
        throw new Error("Failed to load practice questions");
    }

    // -------------------------------------------------
    // 4. Normalize response
    // -------------------------------------------------
    return {
        id: ps.id,
        title: ps.title,
        description: ps.description,
        questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            explanation: q.correct_answer_explanation,
            options: q.options.map((o) => ({
                id: o.id,
                optionText: o.option_text,
                isCorrect: o.is_correct,
            })),
        })),
    };
}
