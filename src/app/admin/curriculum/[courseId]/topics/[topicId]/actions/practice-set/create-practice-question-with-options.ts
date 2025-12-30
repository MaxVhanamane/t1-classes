"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { CreatePracticeQuestionWithOptionsInput, createPracticeQuestionWithOptionsSchema } from "../../zod-schema/practice-set/practice-question.schema";


export async function createPracticeQuestionWithOptions(
    payload: CreatePracticeQuestionWithOptionsInput
) {
    /**
     * 1. Validate payload
     */
    const parsed =
        createPracticeQuestionWithOptionsSchema.safeParse(payload);

    if (!parsed.success) {
        throw new Error("Invalid question data");
    }

    const {
        courseId,
        topicId,
        practiceSetId,
        question,
        correct_answer_explanation,
        options,
    } = parsed.data;

    /**
     * 2. Enforce EXACTLY one correct option
     */
    const correctCount = options.filter((o) => o.is_correct).length;

    if (correctCount !== 1) {
        throw new Error("Exactly one option must be marked correct");
    }

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    /**
     * 3. Fetch practice set
     */
    const { data: practiceSet, error: psError } = await supabase
        .from("practice_sets")
        .select("id, topic_id")
        .eq("id", practiceSetId)
        .single();

    if (psError || !practiceSet) {
        throw new Error("Practice set not found");
    }

    if (practiceSet.topic_id !== topicId) {
        throw new Error("Practice set does not belong to this topic");
    }

    /**
     * 4. Fetch topic → course
     */
    const { data: topic, error: topicError } = await supabase
        .from("course_structure")
        .select("id, course_id")
        .eq("id", topicId)
        .single();

    if (topicError || !topic) {
        throw new Error("Topic not found");
    }

    if (topic.course_id !== courseId) {
        throw new Error("Topic does not belong to this course");
    }

    /**
     * 5. Ownership check
     */
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (!course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to add questions");
    }

    /**
     * 6. Compute next sort_order
     */
    const { data: lastQuestion } = await supabase
        .from("practice_questions")
        .select("sort_order")
        .eq("practice_set_id", practiceSetId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastQuestion?.sort_order ?? 0) + 1;

    /**
     * 7. Atomic insert via RPC
     */
    const { error: rpcError } = await supabase.rpc(
        "insert_practice_question_with_options",
        {
            p_practice_set_id: practiceSetId,
            p_question: question,
            p_explanation: correct_answer_explanation,
            p_sort_order: nextSortOrder,
            p_options: options,
        }
    );

    if (rpcError) {
        throw new Error(rpcError.message);
    }

    /**
     * 8. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
