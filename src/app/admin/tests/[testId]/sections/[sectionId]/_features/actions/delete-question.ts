"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function deleteQuestion(
    questionId: string,
    testId: string,
    sectionId: string
) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login")
    }
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
