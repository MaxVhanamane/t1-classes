"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { homeworkChapterSchema } from "../zod/homework-chapter.schema";

export async function updateHomeworkChapter(
    chapterId: string,
    input: unknown
): Promise<ServerActionResponse<void>> {
    await requireAdminServerOnly();

    try {
        const parsed = homeworkChapterSchema.safeParse(input);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
        }

        const values = parsed.data;
        const supabase = await createServerSupabaseClient();

        // Calling the fast SECURITY DEFINER RPC
        const { error } = await supabase.rpc("update_homework_chapter", {
            p_chapter_id: chapterId,
            p_class_level: values.class_level ?? null,
            p_subject: values.subject,
            p_target_exam: values.target_exam ?? null,
            p_chapter_number: values.chapter_number,
            p_chapter_name: values.chapter_name,
        });

        if (error) {
            if (error.code === "23505") {
                return { error: "A chapter with this name already exists for this subject/class/exam combination." };
            }
            console.error("[UPDATE_CHAPTER_ERROR]", error);
            return { error: "Failed to update chapter." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[UPDATE_CHAPTER_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
