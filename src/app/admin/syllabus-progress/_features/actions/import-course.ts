"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import { importCourseSchema, ImportCourseInput } from "../zod/syllabus-progress.schema";

export async function importCourse(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can import courses" };
    }

    try {
        const parsed = importCourseSchema.safeParse(input);

        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid import data" };
        }

        const values = input as ImportCourseInput;
        const supabase = await createServerSupabaseClient();

        // 1. Fetch all chapters from the master course
        const { data: chapters, error: chaptersError } = await supabase
            .from("course_structure")
            .select("id, title, sort_order")
            .eq("course_id", values.course_id)
            .eq("structure_type", "chapter")
            .order("sort_order", { ascending: true });

        if (chaptersError || !chapters || chapters.length === 0) {
            return { error: "Failed to load course chapters, or course is empty" };
        }

        // 2. Fetch the current highest sort_order in this section (to avoid collisions)
        const { data: highestChapter } = await supabase
            .from("batch_progress_chapters")
            .select("sort_order")
            .eq("section_id", values.section_id)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const offset = highestChapter ? highestChapter.sort_order : 0;

        // 3. Bulk insert the Chapters, adding the offset to their sort_order
        const newChapters = chapters.map((chap) => ({
            batch_id: values.batch_id,
            section_id: values.section_id,
            title: chap.title,
            sort_order: chap.sort_order + offset, // Keeps them ordered at the bottom
            source_chapter_id: chap.id,
        }));

        const { error: insertChaptersError } = await supabase
            .from("batch_progress_chapters")
            .insert(newChapters);

        if (insertChaptersError) {
            console.error("[IMPORT_COURSE_CHAPTERS_ERROR]", insertChaptersError);
            return { error: "Failed to insert chapters into section" };
        }

        return { data: true };
    } catch (error) {
        console.error("[IMPORT_COURSE_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
