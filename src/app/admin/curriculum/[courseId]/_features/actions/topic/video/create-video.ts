"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { AddVideoFormInput, addVideoFormSchema } from "../../../zod-schema/video.schema";



export async function createVideo(
    courseId: string,
    topicId: string,
    rawData: AddVideoFormInput
) {
    /**
     * 1. Validate input
     */
    const parsed = addVideoFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid video data");
    }

    const {
        title,
        description,
        contentUrl,
        videoProvider,
        durationMinutes,
        isFreePreview,
    } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

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
        throw new Error("You are not allowed to add videos to this course");
    }

    /**
     * 3. Compute next sort_order for this topic
     */
    const { data: lastUnit } = await supabase
        .from("course_units")
        .select("sort_order")
        .eq("structure_id", topicId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextSortOrder = (lastUnit?.sort_order ?? 0) + 1;

    /**
     * 4. Insert video (DRAFT)
     */
    const { error: insertError } = await supabase.from("course_units").insert({
        course_id: courseId,
        structure_id: topicId,
        title,
        description: description || null,
        unit_type: "video",
        content_url: contentUrl,
        video_provider: videoProvider,
        duration_minutes: durationMinutes
            ? Number(durationMinutes)
            : null,
        is_free_preview: isFreePreview,
        is_published: false, // draft
        sort_order: nextSortOrder,
    });

    if (insertError) {
        throw new Error(insertError.message);
    }

    /**
     * 5. Revalidate topic page
     */
    revalidatePath(
        `/admin/curriculum/${courseId}/topics/${topicId}`
    );
}
