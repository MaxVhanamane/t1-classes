"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireAdminServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { homeworkMaterialSchema } from "../zod/homework-material.schema";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export async function createHomeworkMaterial(
    input: unknown
): Promise<ServerActionResponse<string>> {
    const admin = await requireAdminServerOnly();

    try {
        const parsed = homeworkMaterialSchema.safeParse(input);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
        }

        const values = parsed.data;
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase.rpc("create_homework_material", {
            p_chapter_id: values.chapter_id,
            p_title: values.title,
            p_description: values.description ?? null,
            p_homework_type: values.homework_type,
            p_difficulty: values.difficulty,
            p_file_path: values.file_path,
            p_file_size: values.file_size ?? null,
            p_solution_file_path: values.solution_file_path ?? null,
            p_solution_file_size: values.solution_file_size ?? null,
            p_created_by: admin.userId,
        });

        // ==========================================
        // ROLLBACK MECHANISM
        // ==========================================
        if (error || !data) {
            console.error("[CREATE_HOMEWORK_ERROR]", error);

            // If DB insert failed, delete the newly uploaded files from R2
            if (values.file_path) {
                await deleteR2Object(R2_PRIVATE_BUCKET_NAME, values.file_path).catch(console.error);
            }
            if (values.solution_file_path) {
                await deleteR2Object(R2_PRIVATE_BUCKET_NAME, values.solution_file_path).catch(console.error);
            }

            return { error: "Failed to create homework material." };
        }

        return { data };
    } catch (error) {
        console.error("[CREATE_HOMEWORK_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
