"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath, updateTag } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function renameChapter(
    chapterId: string,
    courseId: string,
    newTitle: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {

        // 2. Validate input
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) {
            return { error: "Chapter title cannot be empty" };
        }

        const supabase = await createServerSupabaseClient();

        // 3. Fetch chapter
        const { data: chapter, error: chapterError } = await supabase
            .from("course_structure")
            .select("id, course_id")
            .eq("id", chapterId)
            .single();

        if (chapterError || !chapter) {
            return { error: "Chapter not found" };
        }

        // 4. Fetch course owner
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("created_by, slug")
            .eq("id", chapter.course_id)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        // 5. Authorization
        const isAdmin = staff.role === "admin";
        const isOwner = course.created_by === staff.userId;

        if (!isAdmin && !isOwner) {
            return { error: "Not allowed to edit this chapter" };
        }

        // 6. Update chapter title
        const { error: updateError } = await supabase
            .from("course_structure")
            .update({
                title: trimmedTitle,
                updated_at: new Date().toISOString(),
            })
            .eq("id", chapterId);

        if (updateError) {
            console.error("[RENAME_CHAPTER_UPDATE_ERROR]", updateError);
            return { error: "Failed to rename chapter. Please try again." };
        }

        // 7. Revalidate and invalidate cache
        revalidatePath(`/admin/curriculum/${courseId}`);
        updateTag(`course-outline:enrolled:${course.slug}`);

        // Success: no return needed
    } catch (error) {
        console.error("[RENAME_CHAPTER_ERROR]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
