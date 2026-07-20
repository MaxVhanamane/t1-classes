"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    AddVideoFormInput,
    addVideoFormSchema,
} from "../../../zod-schema/video.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function updateVideo(
    courseId: string,
    videoId: string,
    rawData: AddVideoFormInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        // 1. Validate input
        const parsed = addVideoFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid video data" };
        }

        const supabase = await createServerSupabaseClient();



        // 3. Fetch video (must belong to course)
        const { data: video, error: videoError } = await supabase
            .from("course_units")
            .select("id, course_id, unit_type")
            .eq("id", videoId)
            .single();

        if (videoError || !video) {
            return { error: "Video not found" };
        }

        if (video.unit_type !== "video") {
            return { error: "Invalid unit type" };
        }

        if (video.course_id !== courseId) {
            return { error: "Video does not belong to this course" };
        }

        // 4. Fetch course owner
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        // 5. Authorization
        const isAdmin = staff.role === "admin";
        const isTeacher = staff.role === "teacher";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !(isTeacher && isOwner)) {
            return {
                error: "You are not allowed to update videos in this course",
            };
        }

        // 6. Update video
        const { error: updateError } = await supabase
            .from("course_units")
            .update({
                title: parsed.data.title,
                description: parsed.data.description ?? null,
                content_url: parsed.data.contentUrl,
                duration_minutes: parsed.data.durationMinutes
                    ? Number(parsed.data.durationMinutes)
                    : null,
                is_free_preview: parsed.data.isFreePreview,
                video_provider: parsed.data.videoProvider,
            })
            .eq("id", videoId);

        if (updateError) {
            console.error("[UPDATE_VIDEO_ERROR]", updateError);
            return {
                error: "Failed to update video. Please try again.",
            };
        }

        // 7. Revalidate UI
        revalidatePath(`/admin/courses/${courseId}/curriculum`);
        updateTag(`course-outline:enrolled:${course.slug}`);
    } catch (error) {
        console.error("[UPDATE_VIDEO_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
