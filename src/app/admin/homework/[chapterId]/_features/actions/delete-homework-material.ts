"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function deleteHomeworkMaterial(
    materialId: string
): Promise<ServerActionResponse<void>> {
    await requireAdminServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        const { data: material, error: fetchError } = await supabase
            .from("homework_materials")
            .select("file_path, solution_file_path")
            .eq("id", materialId)
            .single();

        if (fetchError || !material) {
            return { error: "Material not found." };
        }

        const { error: deleteError } = await supabase.rpc("delete_homework_material", {
            p_material_id: materialId,
        });

        if (deleteError) {
            console.error("[DELETE_HOMEWORK_ERROR]", deleteError);
            return { error: "Failed to delete material." };
        }

        if (material.file_path) {
            await deleteR2Object(R2_PRIVATE_BUCKET_NAME, material.file_path);
        }

        if (material.solution_file_path) {
            await deleteR2Object(R2_PRIVATE_BUCKET_NAME, material.solution_file_path);
        }

        return { data: undefined };
    } catch (error) {
        console.error("[DELETE_HOMEWORK_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
