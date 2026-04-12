"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    CreatePracticeQuestionInput,
    createPracticeQuestionSchema,
} from "../../../../zod-schema/practice-set/practice-question.schema";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function createPracticeQuestion(
    payload: CreatePracticeQuestionInput
) {
    /* -------------------------------------------------------
     * 1. Validate Payload
     * ----------------------------------------------------- */
    const parsed = createPracticeQuestionSchema.safeParse(payload);

    if (!parsed.success) {
        throw new Error("Invalid question data");
    }

    const {
        courseId,
        topicId,
        practiceSetId,
        questionText,
        explanation,
        options,
        correctAnswer,
        answerMode,
    } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getAuthIfHasRole(["admin", "teacher"]);
    if (!staff) {
        redirect("/login");
    }

    /* -------------------------------------------------------
     * 2. Validate Practice Set
     * ----------------------------------------------------- */
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

    /* -------------------------------------------------------
     * 3. Validate Topic → Course
     * ----------------------------------------------------- */
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

    /* -------------------------------------------------------
     * 4. Ownership Check
     * ----------------------------------------------------- */
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (!course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.userId;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to add questions");
    }

    /* -------------------------------------------------------
     * 5. Compute Next sort_order
     * ----------------------------------------------------- */
    const { data: lastQuestion } = await supabase
        .from("practice_questions")
        .select("sort_order")
        .eq("practice_set_id", practiceSetId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastQuestion?.sort_order ?? 0) + 1;

    /* -------------------------------------------------------
     * 6. Prepare Payload for RPC
     * ----------------------------------------------------- */


    const optionsPayload = options.map((option, index) => ({
        label: option.label,
        text: option.text,
        sort_order: index + 1,
    }));

    /* -------------------------------------------------------
     * 7. Insert via RPC
     * ----------------------------------------------------- */
    const { error: rpcError } = await supabase.rpc(
        "insert_practice_question_with_options",
        {
            p_practice_set_id: practiceSetId,
            p_question: questionText,
            p_explanation: explanation ?? null,
            p_correct_option_label: correctAnswer, // Pass label only
            p_answer_mode: answerMode,
            p_sort_order: nextSortOrder,
            p_options: optionsPayload,
        }
    );

    if (rpcError) {
        console.error(rpcError);
        throw new Error(rpcError.message);
    }

    /* -------------------------------------------------------
     * 8. Revalidate Cache
     * ----------------------------------------------------- */
    revalidatePath(
        `/admin/curriculum/${courseId}/topics/${topicId}`
    );

    return { success: true };
}
