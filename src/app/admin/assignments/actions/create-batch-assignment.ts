"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { assignHomeworkSchema } from "../_features/zod/assignment.schema";

export async function createBatchAssignment(
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

        //  Switch to RPC call
        const { error } = await supabase.rpc("create_batch_homework_assignment", {
            p_batch_id: values.batch_id,
            p_material_id: values.material_id,
            p_publish_date: new Date(values.publish_date).toISOString(),
            p_due_date: new Date(values.due_date).toISOString(),
            p_is_solution_visible: values.is_solution_visible,
            p_auto_publish_solution_at: values.auto_publish_solution_at
                ? new Date(values.auto_publish_solution_at).toISOString()
                : null,
            p_created_by: admin.userId,
        });

        if (error) {
            // Postgres Unique Constraint Violation Code (still works perfectly with RPCs)
            if (error.code === "23505") {
                return { error: "This material has already been assigned to this batch." };
            }
            console.error("[CREATE_ASSIGNMENT_ERROR]", error);
            return { error: "Failed to assign material." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[CREATE_ASSIGNMENT_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
