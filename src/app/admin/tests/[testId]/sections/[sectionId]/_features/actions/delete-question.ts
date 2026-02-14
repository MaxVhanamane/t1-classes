"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function deleteQuestion(
    questionId: string,
    testId: string,
    sectionId: string
) {
    await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc("rpc_delete_test_question", {
        p_question_id: questionId,
        p_test_id: testId,
        p_section_id: sectionId,
    });

    if (error) {
        console.error("[RPC_DELETE_QUESTION_ERROR]", error);
        throw new Error("FAILED_TO_DELETE_QUESTION");
    }

    revalidatePath(`/admin/tests/${testId}/sections/${sectionId}`);

    return { success: true };
}
