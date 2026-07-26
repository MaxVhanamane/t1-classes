"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { createChapterSchema, CreateChapterInput } from "../zod/syllabus-progress.schema";

export async function createChapter(
    input: unknown
): Promise<ServerActionResponse<string>> {
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can create chapters" };
    }

    try {
        const parsed = createChapterSchema.safeParse(input);

        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid chapter data" };
        }

        const values = input as CreateChapterInput;
        const supabase = await createServerSupabaseClient();

        // 1. Get the current highest sort_order for this specific section
        const { data: highestChapter } = await supabase
            .from("batch_progress_chapters")
            .select("sort_order")
            .eq("section_id", values.section_id)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        // Start at 1 if this is the first chapter in the section
        const nextSortOrder = highestChapter ? highestChapter.sort_order + 1 : 1;

        // 2. Insert the chapter
        const { data, error } = await supabase
            .from("batch_progress_chapters")
            .insert({
                batch_id: values.batch_id,
                section_id: values.section_id,
                title: values.title,
                sort_order: nextSortOrder,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("[CREATE_CHAPTER_ERROR]", error);
            return { error: "Failed to create chapter" };
        }

        return { data: data.id };
    } catch (error) {
        console.error("[CREATE_CHAPTER_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
