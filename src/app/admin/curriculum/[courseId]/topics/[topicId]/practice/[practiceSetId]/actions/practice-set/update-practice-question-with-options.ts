"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    UpdatePracticeQuestionInput,
    updatePracticeQuestionSchema,
} from "../../../../zod-schema/practice-set/practice-question.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function updatePracticeQuestion(
    rawData: UpdatePracticeQuestionInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /* -------------------------------------------------------
         * 1. Validate Input
         * ----------------------------------------------------- */
        const parsed = updatePracticeQuestionSchema.safeParse(rawData);

        if (!parsed.success) {
            return { error: "Invalid question data" };
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


        /* -------------------------------------------------------
         * 2. Validate Practice Set
         * ----------------------------------------------------- */
        const { data: practiceSet, error: psError } = await supabase
            .from("practice_sets")
            .select("id, topic_id")
            .eq("id", practiceSetId)
            .single();

        if (psError || !practiceSet) {
            return { error: "Practice set not found" };
        }

        if (practiceSet.topic_id !== topicId) {
            return {
                error: "Practice set does not belong to this topic",
            };
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
            return { error: "Topic not found" };
        }

        if (topic.course_id !== courseId) {
            return {
                error: "Topic does not belong to this course",
            };
        }

        /* -------------------------------------------------------
         * 4. Ownership Check
         * ----------------------------------------------------- */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return {
                error: "You are not allowed to edit this question",
            };
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
            return { error: "Question not found" };
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
                p_correct_option_label: correctAnswer,
                p_answer_mode: answerMode,
                p_options: optionsPayload,
            }
        );

        if (rpcError) {
            console.error(
                "[UPDATE_PRACTICE_QUESTION_RPC_ERROR]",
                rpcError
            );
            return {
                error: "Failed to update question. Please try again.",
            };
        }

        /* -------------------------------------------------------
         * 8. Revalidate Cache
         * ----------------------------------------------------- */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );

        // No return needed on success
    } catch (error) {
        console.error(
            "[UPDATE_PRACTICE_QUESTION_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
