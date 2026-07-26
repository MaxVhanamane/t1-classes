"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { deleteChapterSchema } from "../zod/syllabus-progress.schema";

export async function deleteChapter(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can delete chapters" };
    }

    try {
        const parsed = deleteChapterSchema.safeParse(input);
        if (!parsed.success) return { error: "Invalid data" };

        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("batch_progress_chapters")
            .delete()
            .eq("id", parsed.data.chapter_id);

        if (error) {
            console.error("[DELETE_CHAPTER_ERROR]", error);
            return { error: "Failed to delete chapter" };
        }

        return { data: true };
    } catch (error) {
        console.error("[DELETE_CHAPTER_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
