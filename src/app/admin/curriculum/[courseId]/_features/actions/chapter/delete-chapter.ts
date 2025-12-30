"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { revalidatePath } from "next/cache";

export async function deleteChapter(chapterId: string, courseId: string) {
    const supabase = await createServerSupabaseClient();
    const staff = await getCurrentStaff(); // admin OR teacher

    // 1. Fetch chapter + ownership
    const { data: chapter, error: chapterError } = await supabase
        .from("course_structure")
        .select("id, course_id")
        .eq("id", chapterId)
        .single();

    if (chapterError || !chapter) {
        throw new Error("Chapter not found");
    }

    // 2. Check ownership (teachers only delete their own course)
    const { data: course } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", chapter.course_id)
        .single();

    if (!course) {
        throw new Error("Course not found");
    }

    const isOwner = course.created_by === staff.id;
    if (!staff.is_admin && !isOwner) {
        throw new Error("You are not allowed to delete this chapter");
    }

    // 3. Block delete if topics exist
    const { count } = await supabase
        .from("course_structure")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", chapterId);

    if (count && count > 0) {
        throw new Error(
            "This chapter contains topics. Delete topics first."
        );
    }

    // 4. Delete chapter
    const { error: deleteError } = await supabase
        .from("course_structure")
        .delete()
        .eq("id", chapterId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    // 5. Revalidate curriculum page
    revalidatePath(`/admin/curriculum/${courseId}`);
}
