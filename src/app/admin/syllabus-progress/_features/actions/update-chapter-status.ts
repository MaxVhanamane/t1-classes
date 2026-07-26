"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import { updateChapterStatusSchema, UpdateChapterStatusInput } from "../zod/syllabus-progress.schema";
import type { ProgressStatus } from "../types/syllabus-progress.types";

// 1. Define the strict payload shape
type ChapterUpdatePayload = {
    status: ProgressStatus;
    updated_by: string;
    started_at?: string | null;
    completed_at?: string | null;
};

export async function updateChapterStatus(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    const staff = await requireStaffServerOnly();

    try {
        const parsed = updateChapterStatusSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message ?? "Invalid status data",
            };
        }

        const values = input as UpdateChapterStatusInput;
        const supabase = await createServerSupabaseClient();

        // 2. Fetch the current state to preserve historical accuracy
        const { data: current, error: fetchError } = await supabase
            .from("batch_progress_chapters")
            .select("started_at, completed_at")
            .eq("id", values.chapter_id)
            .single();

        if (fetchError || !current) {
            return { error: "Chapter not found" };
        }

        // 3. Initialize the strictly-typed payload
        const updatePayload: ChapterUpdatePayload = {
            status: values.status,
            updated_by: staff.userId,
        };

        const now = new Date().toISOString();

        // 4. Smart Date Logic
        if (values.status === "not_started") {
            // Hard reset: User explicitly moved it to Not Started, so we wipe dates
            updatePayload.started_at = null;
            updatePayload.completed_at = null;

        } else if (values.status === "in_progress") {
            // Keep the original start date, or set to now if it's the very first time
            updatePayload.started_at = current.started_at || now;

            // Note: We intentionally DO NOT touch completed_at here. 
            // If they accidentally switch from Completed -> In Progress, 
            // we preserve the old completion date in the database just in case.

        } else if (values.status === "completed") {
            // Ensure both dates exist, but DO NOT overwrite them if they are already set
            updatePayload.started_at = current.started_at || now;
            updatePayload.completed_at = current.completed_at || now;
        }

        // 5. Execute the safe update
        const { error: updateError } = await supabase
            .from("batch_progress_chapters")
            .update(updatePayload)
            .eq("id", values.chapter_id);

        if (updateError) {
            console.error("[UPDATE_CHAPTER_STATUS_ERROR]", updateError);
            return { error: "Failed to update chapter status" };
        }

        return { data: true };

    } catch (error) {
        console.error("[UPDATE_CHAPTER_STATUS_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
