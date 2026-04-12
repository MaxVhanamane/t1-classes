"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { DeletePracticeSetInput, deletePracticeSetSchema } from "../../../../zod-schema/practice-set/practice-set";

export async function deletePracticeSet(
    rawData: DeletePracticeSetInput
) {
    /**
     * 1. Validate
     */
    const parsed = deletePracticeSetSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid delete request");
    }

    const { courseId, topicId, practiceSetId } = parsed.data;

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
        .select("course_id")
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
        throw new Error("Not allowed");
    }

    /**
     * 5. Delete practice set
     * (questions + options cascade automatically)
     */
    const { error: deleteError } = await supabase
        .from("practice_sets")
        .delete()
        .eq("id", practiceSetId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 6. Revalidate
     */
    revalidatePath(`/admin/curriculum/${courseId}/topics/${topicId}`);
}
