"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { z } from "zod";
import { addChapterFormSchema } from "../../zod-schema/chapter.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function createChapter(
    courseId: string,
    rawData: z.infer<typeof addChapterFormSchema>
): Promise<ServerActionResponse> {

    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {
        // 1. Validate input
        const parsed = addChapterFormSchema.safeParse(rawData);
        if (!parsed.success) {
            return { error: "Invalid chapter data" };
        }

        const { title } = parsed.data;

        const supabase = await createServerSupabaseClient();

        // 3. Fetch course + ownership check
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, created_by")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return { error: "Course not found" };
        }

        // Teachers can only modify their own courses
        if (staff.role === "teacher" && course.created_by !== staff.userId) {
            return { error: "You are not allowed to modify this course" };
        }

        // 4. Auto sort_order (append to end)
        const { count, error: countError } = await supabase
            .from("course_structure")
            .select("id", { count: "exact", head: true })
            .eq("course_id", courseId)
            .eq("structure_type", "chapter");

        if (countError) {
            console.error("[CREATE_CHAPTER_COUNT_ERROR]", countError);
            return { error: "Failed to determine chapter order" };
        }

        const nextSortOrder = (count ?? 0) + 1;

        // 5. Insert chapter
        const { error: insertError } = await supabase
            .from("course_structure")
            .insert({
                course_id: courseId,
                title,
                structure_type: "chapter",
                sort_order: nextSortOrder,
            });

        if (insertError) {
            console.error("[CREATE_CHAPTER_INSERT_ERROR]", insertError);
            return { error: "Failed to create chapter. Please try again." };
        }

        // 6. Revalidate curriculum page
        revalidatePath(`/admin/curriculum/${courseId}`);

        // Success: no return needed
    } catch (error) {
        console.error("[CREATE_CHAPTER_ERROR]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
