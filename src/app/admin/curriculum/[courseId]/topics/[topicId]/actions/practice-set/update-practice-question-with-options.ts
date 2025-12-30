"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { UpdatePracticeQuestionWithOptionsInput, updatePracticeQuestionWithOptionsSchema } from "../../zod-schema/practice-set/practice-question.schema";


export async function updatePracticeQuestionWithOptions(
    rawData: UpdatePracticeQuestionWithOptionsInput
) {
    /**
     * 1. Validate input
     */
    const parsed =
        updatePracticeQuestionWithOptionsSchema.safeParse(rawData);

    if (!parsed.success) {
        throw new Error("Invalid question data");
    }

    const {
        courseId,
        topicId,
        practiceSetId,
        questionId,
        question,
        correct_answer_explanation,
        options,
    } = parsed.data;

    /**
     * 2. Enforce exactly ONE correct option
     */
    const correctCount = options.filter((o) => o.is_correct).length;

    if (correctCount !== 1) {
        throw new Error("Exactly one option must be marked correct");
    }

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff();

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
        throw new Error("You are not allowed to edit this question");
    }

    /**
     * 6. Ensure question belongs to this practice set
     */
    const { data: existingQuestion, error: qError } = await supabase
        .from("practice_questions")
        .select("id")
        .eq("id", questionId)
        .eq("practice_set_id", practiceSetId)
        .single();

    if (qError || !existingQuestion) {
        throw new Error("Question not found");
    }

    /**
     * 7. TRANSACTION (update question + replace options)
     */
    const { error: rpcError } = await supabase.rpc(
        "update_practice_question_with_options",
        {
            p_question_id: questionId,
            p_question: question,
            p_explanation: correct_answer_explanation,
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
