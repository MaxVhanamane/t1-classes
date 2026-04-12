"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function deleteTopic(courseId: string, topicId: string) {
    const supabase = await createServerSupabaseClient();
    const staff = await getAuthIfHasRole(["admin", "teacher"]); // admin OR teacher
    if (!staff) {
        redirect("/login");
    }

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
    const isOwner = course.created_by === staff.userId;

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
