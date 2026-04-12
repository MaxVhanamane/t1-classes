"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import {
    UpdatePracticeQuestionInput,
    updatePracticeQuestionSchema,
} from "../../../../zod-schema/practice-set/practice-question.schema";

export async function updatePracticeQuestion(
    rawData: UpdatePracticeQuestionInput
) {
    /* -------------------------------------------------------
     * 1. Validate Input
     * ----------------------------------------------------- */
    const parsed = updatePracticeQuestionSchema.safeParse(rawData);

    if (!parsed.success) {
        throw new Error("Invalid question data");
    }

    const {
        courseId,
        topicId,
        practiceSetId,
        questionId,
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
        throw new Error("You are not allowed to edit this question");
    }

    /* -------------------------------------------------------
     * 5. Ensure Question Belongs to Practice Set
     * ----------------------------------------------------- */
    const { data: existingQuestion, error: qError } = await supabase
        .from("practice_questions")
        .select("id")
        .eq("id", questionId)
        .eq("practice_set_id", practiceSetId)
        .single();

    if (qError || !existingQuestion) {
        throw new Error("Question not found");
    }

    /* -------------------------------------------------------
     * 6. Prepare Payload for RPC
     * ----------------------------------------------------- */


    const optionsPayload = options.map((option, index) => ({
        label: option.label,
        text: option.text,
        sort_order: index + 1,
    }));

    /* -------------------------------------------------------
     * 7. Atomic Update via RPC
     * ----------------------------------------------------- */
    const { error: rpcError } = await supabase.rpc(
        "update_practice_question_with_options",
        {
            p_question_id: questionId,
            p_question: questionText,
            p_explanation: explanation ?? null,
            p_correct_option_label: correctAnswer, // Pass label only
            p_answer_mode: answerMode,
            p_options: optionsPayload,
        }
    );
    if (rpcError) {
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
