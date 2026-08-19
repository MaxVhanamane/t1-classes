"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import type { StudentMarkingRow } from "../../_features/types/marking.types";

export async function fetchStudentsForMarking(
    batchId: string,
    assignmentId: string
): Promise<StudentMarkingRow[]> {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc("get_homework_marking_list", {
        p_assignment_id: assignmentId,
        p_batch_id: batchId,
    });

    if (error) {
        console.error("[FETCH_MARKING_LIST_ERROR]", error.message);
        throw new Error("Failed to fetch students for marking");
    }

    return data as StudentMarkingRow[];
}
