"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { z } from "zod";
import { addChapterFormSchema } from "../../zod-schema/chapter.schema";
import { redirect } from "next/navigation";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { ROLE_GROUPS } from "@/src/lib/auth/role-groups";

export async function createChapter(
    courseId: string,
    rawData: z.infer<typeof addChapterFormSchema>
) {


    // 1. Validate input
    const parsed = addChapterFormSchema.safeParse(rawData);
    if (!parsed.success) {
        throw new Error("Invalid chapter data");
    }

    const { title } = parsed.data;

    // 2. Auth: admin OR teacher
    const user = await getAuthIfHasRole(ROLE_GROUPS.STAFF); // admin OR teacher
    if (!user) {
        redirect("/login")
    }

    const supabase = await createServerSupabaseClient();

    // 3. Fetch course + ownership check
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, created_by")
        .eq("id", courseId)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    // Teachers can only modify their own courses
    if (user.role === "teacher" && course.created_by !== user.userId) {
        throw new Error("You are not allowed to modify this course");
    }

    // 4. Auto sort_order (append to end)
    const { count } = await supabase
        .from("course_structure")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("structure_type", "chapter");

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
        throw new Error(insertError.message);
    }

    // 6. Revalidate curriculum page
    // revalidatePath(`/admin/curriculum/${courseId}`);
}
