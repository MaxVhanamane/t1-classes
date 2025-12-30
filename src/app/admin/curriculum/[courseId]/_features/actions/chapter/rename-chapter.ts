"use server";

import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function renameChapter(
    chapterId: string,
    courseId: string,
    newTitle: string
) {
    const staff = await getCurrentStaff();

    if (!newTitle.trim()) {
        throw new Error("Chapter title cannot be empty");
    }

    const supabase = await createServerSupabaseClient();

    // 1. Fetch chapter
    const { data: chapter, error } = await supabase
        .from("course_structure")
        .select("id, course_id")
        .eq("id", chapterId)
        .single();

    if (error || !chapter) {
        throw new Error("Chapter not found");
    }

    // 2. Fetch course owner
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("created_by")
        .eq("id", chapter.course_id)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    // 3. Authorization
    const isAdmin = staff.role === "admin";
    const isOwner = course.created_by === staff.id;

    if (!isAdmin && !isOwner) {
        throw new Error("Not allowed to edit this chapter");
    }

    // 4. Update
    const { error: updateError } = await supabase
        .from("course_structure")
        .update({
            title: newTitle.trim(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", chapterId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    revalidatePath(`/admin/curriculum/${courseId}`);
}
