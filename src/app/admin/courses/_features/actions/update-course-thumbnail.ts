"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { updateTag } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

/* -------------------------------------------------- */
/* Update Thumbnail (KEY ONLY)                        */
/* -------------------------------------------------- */

export async function updateCourseThumbnail(
    courseId: string,
    newKey: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        const { data, error: fetchError } = await supabase
            .from("courses")
            .select("created_by, thumbnail_image, slug, category")
            .eq("id", courseId)
            .single();

        if (fetchError || !data) {
            return { error: "Course not found" };
        }

        if (
            staff.role === "teacher" &&
            data.created_by !== staff.userId
        ) {
            return { error: "Unauthorized" };
        }

        /* ---------- delete old thumbnail ---------- */
        if (
            data.thumbnail_image &&
            data.thumbnail_image !== newKey
        ) {
            await deleteR2Object(
                process.env.R2_PUBLIC_BUCKET_NAME!,
                data.thumbnail_image
            );
        }

        /* ---------- update course ---------- */
        const { error: updateError } = await supabase
            .from("courses")
            .update({
                thumbnail_image: newKey,
                updated_by: staff.userId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", courseId);

        if (updateError) {
            console.error(
                "[UPDATE_COURSE_THUMBNAIL_ERROR]",
                updateError
            );
            return {
                error:
                    "Failed to update course thumbnail. Please try again.",
            };
        }

        /* ---------- revalidate ---------- */

        updateTag(`course-detail-${data.slug}`);
        updateTag(`course-list-${data.category}`);
    } catch (error) {
        console.error(
            "[UPDATE_COURSE_THUMBNAIL_FATAL]",
            error
        );
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
