"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { homeworkChapterSchema } from "../zod/homework-chapter.schema";

export async function createHomeworkChapter(
    input: unknown
): Promise<ServerActionResponse<string>> {
    const admin = await requireAdminServerOnly();

    try {
        const parsed = homeworkChapterSchema.safeParse(input);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
        }

        const values = parsed.data;
        const supabase = await createServerSupabaseClient();

        // Calling the fast SECURITY DEFINER RPC
        const { data, error } = await supabase.rpc("create_homework_chapter", {
            p_class_level: values.class_level ?? null,
            p_subject: values.subject,
            p_target_exam: values.target_exam ?? null,
            p_chapter_number: values.chapter_number,
            p_chapter_name: values.chapter_name,
            p_created_by: admin.userId,
        });

        if (error) {
            // Postgres unique violation code
            if (error.code === "23505") {
                return { error: "A chapter with this name already exists for this subject/class/exam combination." };
            }
            console.error("[CREATE_CHAPTER_ERROR]", error);
            return { error: "Failed to create chapter." };
        }

        return { data }; // RPC returns the new UUID directly
    } catch (error) {
        console.error("[CREATE_CHAPTER_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
