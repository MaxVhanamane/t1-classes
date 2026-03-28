"use server";

import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { ROLE_GROUPS } from "@/src/lib/auth/role-groups";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function renameChapter(
    chapterId: string,
    courseId: string,
    newTitle: string
) {
    const staff = await getAuthIfHasRole(ROLE_GROUPS.STAFF); // admin OR teacher
    if (!staff) {
        redirect("/login")
    }


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
    const isOwner = course.created_by === staff.userId;

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
