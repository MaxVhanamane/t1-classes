"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deleteVideo(
    courseId: string,
    videoId: string,
    topicId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();


        /**
         * 2. Fetch video
         */
        const { data: video, error: videoError } = await supabase
            .from("course_units")
            .select("id, course_id, unit_type")
            .eq("id", videoId)
            .single();

        if (videoError || !video) {
            return { error: "Video not found" };
        }

        if (video.course_id !== courseId) {
            return { error: "Unauthorized" };
        }

        if (video.unit_type !== "video") {
            return { error: "Invalid unit type" };
        }

        /**
         * 3. Fetch course owner
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isTeacher = staff.role === "teacher";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !(isTeacher && isOwner)) {
            return { error: "You are not allowed to delete this video" };
        }

        /**
         * 4. Delete video
         */
        const { error: deleteError } = await supabase
            .from("course_units")
            .delete()
            .eq("id", videoId);

        if (deleteError) {
            console.error("[DELETE_VIDEO_ERROR]", deleteError);
            return { error: "Failed to delete video. Please try again." };
        }

        /**
         * 5. Revalidate topic page
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[DELETE_VIDEO_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
