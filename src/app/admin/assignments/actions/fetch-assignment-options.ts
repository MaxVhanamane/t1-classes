"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function getBatchMetadata(batchId: string) {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("batches")
        .select("id, title, subjects, class_level, target_exam")
        .eq("id", batchId)
        .single();

    if (error) throw new Error("Failed to load batch details");
    return data;
}

export async function getFilteredChapters(
    subject: string,
    classLevel: number | null,
    targetExam: string | null
) {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from("homework_chapters")
        .select("id, chapter_name, chapter_number")
        .eq("subject", subject)
        .order("chapter_number", { ascending: true, nullsFirst: false });

    if (classLevel) query = query.eq("class_level", classLevel);
    if (targetExam) query = query.eq("target_exam", targetExam);

    const { data, error } = await query;
    if (error) throw new Error("Failed to fetch chapters");
    return data;
}

export async function getFilteredMaterials(chapterId: string) {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("homework_materials")

        .select("id, title, homework_type, file_path, solution_file_path")
        .eq("chapter_id", chapterId)
        .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch materials");

    return data.map((m) => ({
        ...m,
        hasSolution: !!m.solution_file_path,
    }));
}
