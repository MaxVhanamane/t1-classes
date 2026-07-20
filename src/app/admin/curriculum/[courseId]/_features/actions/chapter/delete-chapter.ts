"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath, updateTag } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deleteChapter(
    chapterId: string,
    courseId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        const supabase = await createServerSupabaseClient();


        // Fetch chapter
        const { data: chapter } = await supabase
            .from("course_structure")
            .select("id, course_id")
            .eq("id", chapterId)
            .single();

        if (!chapter) {
            return { error: "Chapter not found" };
        }

        // Fetch course
        const { data: course } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", chapter.course_id)
            .single();

        if (!course) {
            return { error: "Course not found" };
        }

        const isOwner = course.created_by === staff.userId;
        if (staff.role !== "admin" && !isOwner) {
            return { error: "You are not allowed to delete this chapter" };
        }

        // Check if topics exist
        const { count } = await supabase
            .from("course_structure")
            .select("id", { count: "exact", head: true })
            .eq("parent_id", chapterId);

        if (count && count > 0) {
            return {
                error: "This chapter contains topics. Delete topics first.",
            };
        }

        // Delete chapter
        const { error: deleteError } = await supabase
            .from("course_structure")
            .delete()
            .eq("id", chapterId);
        if (deleteError) {
            console.error("[DELETE_CHAPTER_DB_ERROR]", deleteError);
            return { error: "Failed to delete chapter. Please try again." };
        }

        // Invalidate cache
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);

        // No return on success
    } catch (error) {
        console.error("[DELETE_CHAPTER_ERROR]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
