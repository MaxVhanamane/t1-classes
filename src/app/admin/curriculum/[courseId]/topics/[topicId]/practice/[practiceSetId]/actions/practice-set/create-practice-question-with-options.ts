"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    CreatePracticeQuestionInput,
    createPracticeQuestionSchema,
} from "../../../../zod-schema/practice-set/practice-question.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createPracticeQuestion(
    payload: CreatePracticeQuestionInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /* -------------------------------------------------------
         * 1. Validate Payload
         * ----------------------------------------------------- */
        const parsed = createPracticeQuestionSchema.safeParse(payload);

        if (!parsed.success) {
            return { error: "Invalid question data" };
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
            return { error: "You are not allowed to add questions" };
        }

        /* -------------------------------------------------------
         * 5. Compute Next sort_order
         * ----------------------------------------------------- */
        const { data: lastQuestion, error: lastQuestionError } =
            await supabase
                .from("practice_questions")
                .select("sort_order")
                .eq("practice_set_id", practiceSetId)
                .order("sort_order", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (lastQuestionError) {
            console.error(
                "[CREATE_PRACTICE_QUESTION_SORT_ERROR]",
                lastQuestionError
            );
            return {
                error: "Failed to determine question order",
            };
        }

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
                p_correct_option_label: correctAnswer,
                p_answer_mode: answerMode,
                p_sort_order: nextSortOrder,
                p_options: optionsPayload,
            }
        );

        if (rpcError) {
            console.error(
                "[CREATE_PRACTICE_QUESTION_RPC_ERROR]",
                rpcError
            );
            return {
                error:
                    "Failed to create question. Please try again.",
            };
        }

        /* -------------------------------------------------------
         * 8. Revalidate Cache
         * ----------------------------------------------------- */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );

        // No return on success
    } catch (error) {
        console.error(
            "[CREATE_PRACTICE_QUESTION_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
