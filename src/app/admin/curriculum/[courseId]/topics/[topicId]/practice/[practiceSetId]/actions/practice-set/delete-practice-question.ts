"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    DeletePracticeQuestionInput,
    deletePracticeQuestionSchema,
} from "../../../../zod-schema/practice-set/practice-question.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function deletePracticeQuestion(
    rawData: DeletePracticeQuestionInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = deletePracticeQuestionSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid delete request" };
        }

        const { courseId, topicId, practiceSetId, questionId } = parsed.data;

        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch practice set
         */
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

        /**
         * 3. Fetch topic → course
         */
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

        /**
         * 4. Ownership check
         */
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
                error: "You are not allowed to delete this question",
            };
        }

        /**
         * 5. Ensure question belongs to this practice set
         */
        const { data: question, error: qError } = await supabase
            .from("practice_questions")
            .select("id")
            .eq("id", questionId)
            .eq("practice_set_id", practiceSetId)
            .single();

        if (qError || !question) {
            return { error: "Question not found" };
        }

        /**
         * 6. Delete question (options cascade automatically)
         */
        const { error: deleteError } = await supabase
            .from("practice_questions")
            .delete()
            .eq("id", questionId);

        if (deleteError) {
            console.error(
                "[DELETE_PRACTICE_QUESTION_ERROR]",
                deleteError
            );
            return {
                error: "Failed to delete question. Please try again.",
            };
        }

        /**
         * 7. Revalidate
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );

        // No return needed on success
    } catch (error) {
        console.error(
            "[DELETE_PRACTICE_QUESTION_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
