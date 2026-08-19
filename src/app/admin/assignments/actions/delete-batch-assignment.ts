"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deleteBatchAssignment(
    assignmentId: string
): Promise<ServerActionResponse<void>> {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    try {
        const { error } = await supabase.rpc("delete_batch_homework_assignment", {
            p_assignment_id: assignmentId,
        });

        if (error) {
            console.error("[DELETE_ASSIGNMENT_ERROR]", error.message);
            return { error: "Failed to delete assignment." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[DELETE_ASSIGNMENT_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
