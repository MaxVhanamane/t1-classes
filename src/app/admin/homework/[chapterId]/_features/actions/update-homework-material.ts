"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { homeworkMaterialSchema } from "../zod/homework-material.schema";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function updateHomeworkMaterial(
    materialId: string,
    input: unknown
): Promise<ServerActionResponse<void>> {
    const admin = await requireAdminServerOnly();

    try {
        const parsed = homeworkMaterialSchema.safeParse(input);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
        }

        const values = parsed.data;
        const supabase = await createServerSupabaseClient();

        const { data: existing, error: existingError } = await supabase
            .from("homework_materials")
            .select("file_path, solution_file_path")
            .eq("id", materialId)
            .single();

        if (existingError || !existing) {
            return { error: "Homework material not found." };
        }

        const { error } = await supabase.rpc("update_homework_material", {
            p_material_id: materialId,
            p_chapter_id: values.chapter_id,
            p_title: values.title,
            p_description: values.description ?? null,
            p_homework_type: values.homework_type,
            p_difficulty: values.difficulty,
            p_file_path: values.file_path,
            p_file_size: values.file_size ?? null,
            p_solution_file_path: values.solution_file_path ?? null,
            p_solution_file_size: values.solution_file_size ?? null,
            p_updated_by: admin.userId,
        });

        // ==========================================
        // ROLLBACK MECHANISM (DB UPDATE FAILED)
        // ==========================================
        if (error) {
            console.error("[UPDATE_HOMEWORK_ERROR]", error);

            // Delete newly uploaded files, being careful NOT to delete the existing ones!
            if (values.file_path && values.file_path !== existing.file_path) {
                await deleteR2Object(R2_PRIVATE_BUCKET_NAME, values.file_path).catch(console.error);
            }
            if (values.solution_file_path && values.solution_file_path !== existing.solution_file_path) {
                await deleteR2Object(R2_PRIVATE_BUCKET_NAME, values.solution_file_path).catch(console.error);
            }

            return { error: "Failed to update homework material." };
        }

        // ==========================================
        // CLEANUP MECHANISM (DB UPDATE SUCCEEDED)
        // ==========================================
        // Now it's safe to delete the OLD files from R2
        if (existing.file_path && values.file_path && existing.file_path !== values.file_path) {
            await deleteR2Object(R2_PRIVATE_BUCKET_NAME, existing.file_path).catch(console.error);
        }

        if (existing.solution_file_path && values.solution_file_path && existing.solution_file_path !== values.solution_file_path) {
            await deleteR2Object(R2_PRIVATE_BUCKET_NAME, existing.solution_file_path).catch(console.error);
        }

        return { data: undefined };
    } catch (error) {
        console.error("[UPDATE_HOMEWORK_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
