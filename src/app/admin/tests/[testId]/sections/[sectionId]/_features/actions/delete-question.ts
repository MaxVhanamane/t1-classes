"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function deleteQuestion(
    questionId: string,
    testId: string,
    sectionId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        const { error } = await supabase.rpc("rpc_delete_test_question", {
            p_question_id: questionId,
            p_test_id: testId,
            p_section_id: sectionId,
        });

        if (error) {
            console.error("[RPC_DELETE_QUESTION_ERROR]", error);
            return { error: "Failed to delete question. Please try again." };
        }


    } catch (err) {
        console.error("[DELETE_QUESTION_FATAL]", err);
        return { error: "Something went wrong. Please try again." };
    }
}
