"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import type { MarkingSubmissionPayload } from "../../_features/types/marking.types";

export async function bulkSaveSubmissions(
    assignmentId: string,
    submissions: MarkingSubmissionPayload[]
): Promise<ServerActionResponse<void>> {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();

    try {
        const payload = submissions.map((s) => ({
            assignment_id: assignmentId,
            student_id: s.student_id,
            is_completed: s.is_completed,
        }));

        const { error } = await supabase.rpc("bulk_upsert_homework_submissions", {
            p_submissions: payload,
        });

        if (error) {
            console.error("[BULK_SAVE_SUBMISSIONS_ERROR]", error.message);
            return { error: "Failed to save submissions." };
        }

        return { data: undefined };
    } catch (error) {
        console.error("[BULK_SAVE_SUBMISSIONS_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
