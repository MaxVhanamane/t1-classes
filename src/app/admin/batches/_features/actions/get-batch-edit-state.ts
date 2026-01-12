"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function getBatchEditState(batchId: string): Promise<{
    locked: boolean;
}> {
    // 1. Auth + staff check
    const staff = await getCurrentStaff();
    if (staff.role !== "admin") {
        throw new Error("Only admins can edit batches");
    }

    // 2. DB check (EXISTS is cheap and fast)
    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { count, error } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("target_type", "batch")
        .eq("batch_id", batchId)
        .in("status", ["ongoing", "paused"])
        .lte("access_starts_at", now)
        .or(
            `access_ends_at.is.null,access_ends_at.gte.${now}`
        );

    if (error) {
        throw new Error(error.message);
    }

    return {
        locked: (count ?? 0) > 0,
    };

}
