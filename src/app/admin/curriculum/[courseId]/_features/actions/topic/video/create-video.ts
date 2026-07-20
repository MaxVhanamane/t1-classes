"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    AddVideoFormInput,
    addVideoFormSchema,
} from "../../../zod-schema/video.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function createVideo(
    courseId: string,
    topicId: string,
    rawData: AddVideoFormInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        /**
         * 1. Validate input
         */
        const parsed = addVideoFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid video data" };
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


        /**
         * 2. Fetch course owner
         */
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        const isAdmin = staff.role === "admin";
        const isTeacher = staff.role === "teacher";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !(isTeacher && isOwner)) {
            return {
                error: "You are not allowed to add videos to this course",
            };
        }

        /**
         * 3. Compute next sort_order for this topic
         */
        const { data: lastUnit, error: lastUnitError } = await supabase
            .from("course_units")
            .select("sort_order")
            .eq("structure_id", topicId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastUnitError) {
            console.error("[CREATE_VIDEO_SORT_ORDER_ERROR]", lastUnitError);
            return { error: "Failed to determine video order" };
        }

        const nextSortOrder = (lastUnit?.sort_order ?? 0) + 1;

        /**
         * 4. Insert video (DRAFT)
         */
        const { error: insertError } = await supabase
            .from("course_units")
            .insert({
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
            console.error("[CREATE_VIDEO_INSERT_ERROR]", insertError);
            return { error: "Failed to create video. Please try again." };
        }

        /**
         * 5. Revalidate topic page
         */
        revalidatePath(
            `/admin/curriculum/${courseId}/topics/${topicId}`
        );
    } catch (error) {
        console.error("[CREATE_VIDEO_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
