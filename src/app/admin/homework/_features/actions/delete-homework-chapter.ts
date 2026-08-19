"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deleteHomeworkChapter(
    chapterId: string
): Promise<ServerActionResponse<void>> {
    await requireAdminServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        // Calling the fast SECURITY DEFINER RPC
        const { error } = await supabase.rpc("delete_homework_chapter", {
            p_chapter_id: chapterId,
        });

        if (error) {
            console.error("[DELETE_CHAPTER_ERROR]", error);
            return { error: "Failed to delete chapter. It might have materials attached." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[DELETE_CHAPTER_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
