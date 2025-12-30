"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { DeletePracticeQuestionInput, deletePracticeQuestionSchema } from "../../zod-schema/practice-set/practice-question.schema";


export async function deletePracticeQuestion(
    rawData: DeletePracticeQuestionInput
) {
    /**
     * 1. Validate input
     */
    const parsed = deletePracticeQuestionSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid delete request");
    }

    const { courseId, topicId, practiceSetId, questionId } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

    /**
     * 2. Fetch practice set
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
     * 3. Fetch topic → course
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
     * 4. Ownership check
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
        throw new Error("You are not allowed to delete this question");
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
        throw new Error("Question not found");
    }

    /**
     * 6. Delete question (options cascade automatically)
     */
    const { error: deleteError } = await supabase
        .from("practice_questions")
        .delete()
        .eq("id", questionId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 7. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
