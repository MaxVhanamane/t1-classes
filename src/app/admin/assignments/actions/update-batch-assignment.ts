"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { assignHomeworkSchema } from "../_features/zod/assignment.schema";

export async function updateBatchAssignment(
    assignmentId: string,
    input: unknown
): Promise<ServerActionResponse<void>> {
    const admin = await requireStaffServerOnly();

    try {
        const parsed = assignHomeworkSchema.safeParse(input);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
        }

        const values = parsed.data;
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase.rpc("update_batch_homework_assignment", {
            p_assignment_id: assignmentId,
            p_publish_date: new Date(values.publish_date).toISOString(),
            p_due_date: new Date(values.due_date).toISOString(),
            p_is_solution_visible: values.is_solution_visible,
            p_auto_publish_solution_at: values.auto_publish_solution_at
                ? new Date(values.auto_publish_solution_at).toISOString()
                : null,
            p_updated_by: admin.userId,
        });

        if (error) {
            console.error("[UPDATE_ASSIGNMENT_ERROR]", error.message);
            return { error: "Failed to update assignment." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[UPDATE_ASSIGNMENT_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
