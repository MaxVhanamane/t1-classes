"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { AddVideoFormInput, addVideoFormSchema } from "../../../zod-schema/video.schema";


export async function updateVideo(
    courseId: string,
    videoId: string,
    rawData: AddVideoFormInput
) {
    // 1. Validate input
    const parsed = addVideoFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid video data");
    }

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    // 2. Fetch video (must belong to course)
    const { data: video, error: videoError } = await supabase
        .from("course_units")
        .select("id, course_id, unit_type")
        .eq("id", videoId)
        .single();

    if (videoError || !video) {
        throw new Error("Video not found");
    }

    if (video.unit_type !== "video") {
        throw new Error("Invalid unit type");
    }

    if (video.course_id !== courseId) {
        throw new Error("Video does not belong to this course");
    }

    // 3. Fetch course owner
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", courseId)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    // 4. Authorization (THIS is the important part)
    const isAdmin = staff.role === "admin";
    const isTeacher = staff.role === "teacher";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !(isTeacher && isOwner)) {
        throw new Error("You are not allowed to update videos in this course");
    }

    // 5. Update video
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
        throw new Error(updateError.message);
    }

    // 6. Revalidate UI
    revalidatePath(`/admin/courses/${courseId}/curriculum`);
}
