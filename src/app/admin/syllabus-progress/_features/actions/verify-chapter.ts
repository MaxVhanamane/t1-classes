"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { verifyChapterSchema } from "../zod/syllabus-progress.schema";


export async function verifyChapter(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    console.log("hey")
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can verify chapters" };
    }

    try {
        const parsed = verifyChapterSchema.safeParse(input);
        if (!parsed.success) return { error: "Invalid data" };

        const supabase = await createServerSupabaseClient();
        const now = new Date().toISOString();

        const { error } = await supabase
            .from("batch_progress_chapters")
            .update({
                verified_at: now,
                verified_by: staff.userId,
            })
            .eq("id", parsed.data.chapter_id);

        if (error) {
            console.error("[VERIFY_CHAPTER_ERROR]", error);
            return { error: "Failed to verify chapter" };
        }

        return { data: true };
    } catch (error) {
        console.error("[VERIFY_CHAPTER_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
