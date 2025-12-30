"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function deleteTopic(courseId: string, topicId: string) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    /**
     * 1. Fetch topic (NO joins)
     */
    const { data: topic, error: topicError } = await supabase
        .from("course_structure")
        .select("id, course_id, structure_type")
        .eq("id", topicId)
        .single();

    if (topicError || !topic) {
        throw new Error("Topic not found");
    }

    if (topic.structure_type !== "topic") {
        throw new Error("Invalid topic");
    }

    if (topic.course_id !== courseId) {
        throw new Error("Topic does not belong to this course");
    }

    /**
     * 2. Fetch course owner (separate query — THIS IS KEY)
     */
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", topic.course_id)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    /**
     * 3. Authorization
     */
    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("You are not allowed to delete this topic");
    }

    /**
     * 4. Delete topic
     */
    const { error: deleteError } = await supabase
        .from("course_structure")
        .delete()
        .eq("id", topicId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 5. Revalidate curriculum page
     */

    revalidatePath(`/admin/curriculum/${courseId}`);
}
