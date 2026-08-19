"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function getChapterMaterialsOptions(chapterId: string) {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    // Fetch only what we need for the dropdown
    const { data, error } = await supabase
        .from("homework_materials")
        .select("id, title, homework_type, solution_file_path")
        .eq("chapter_id", chapterId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.homework_type,
        hasSolution: !!d.solution_file_path, // Convert path string to boolean
    }));
}
