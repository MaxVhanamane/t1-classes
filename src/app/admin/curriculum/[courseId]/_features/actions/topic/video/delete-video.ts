"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function deleteVideo(
    courseId: string,
    videoId: string,
    topicId: string
) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    /**
     * 1. Fetch video
     */
    const { data: video, error: videoError } = await supabase
        .from("course_units")
        .select("id, course_id, unit_type")
        .eq("id", videoId)
        .single();

    if (videoError || !video) {
        throw new Error("Video not found");
    }

    if (video.course_id !== courseId) {
        throw new Error("Unauthorized");
    }

    if (video.unit_type !== "video") {
        throw new Error("Invalid unit type");
    }

    /**
     * 2. Fetch course owner
     */
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    const isAdmin = staff.role === "admin";
    const isTeacher = staff.role === "teacher";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !(isTeacher && isOwner)) {
        throw new Error("You are not allowed to delete this video");
    }

    /**
     * 3. Delete video
     */
    const { error: deleteError } = await supabase
        .from("course_units")
        .delete()
        .eq("id", videoId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    /**
     * 4. Revalidate topic page
     */
    revalidatePath(
        `/admin/curriculum/${courseId}/topics/${topicId}`
    );
}
