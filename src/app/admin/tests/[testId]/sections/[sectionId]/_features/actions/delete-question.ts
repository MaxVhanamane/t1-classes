"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

export async function deleteQuestion(
    questionId: string,
    testId: string,
    sectionId: string,
    r2Images: { key: string; bucket: string }[] // <-- Receive keys from client
): Promise<ServerActionResponse> {
    await requireStaffServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        // 1. DELETE FROM DATABASE
        const { error } = await supabase.rpc("rpc_delete_test_question", {
            p_question_id: questionId,
            p_test_id: testId,
            p_section_id: sectionId,
        });

        if (error) {
            console.error("[RPC_DELETE_QUESTION_ERROR]", error);
            return { error: "Failed to delete question. Please try again." };
        }

        // 2. CLEAN UP R2 STORAGE
        if (r2Images && r2Images.length > 0) {
            await Promise.all(
                r2Images.map((img) => deleteR2Object(img.bucket, img.key))
            );
        }

    } catch (err) {
        console.error("[DELETE_QUESTION_FATAL]", err);
        return { error: "Something went wrong. Please try again." };
    }
}
