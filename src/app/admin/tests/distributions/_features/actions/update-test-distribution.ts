"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ScheduleTestInput } from "../../../schedule/_features/zod/schedule-test.schema";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { updateTag } from "next/cache";

export async function updateTestDistribution(
    distributionId: string,
    input: ScheduleTestInput
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        /* ---------------- Fetch Distribution ---------------- */
        const { data: dist, error: fetchError } = await supabase
            .from("test_distributions")
            .select("id, created_by, starts_at, ends_at")
            .eq("id", distributionId)
            .single();

        if (fetchError || !dist) {
            return { error: "DISTRIBUTION_NOT_FOUND" };
        }

        /* ---------------- Permissions ---------------- */
        if (staff.role !== "admin" && dist.created_by !== staff.userId) {
            return { error: "NOT_AUTHORIZED" };
        }

        /* ---------------- Status Check ---------------- */
        const status = computeDistributionStatus(
            dist.starts_at,
            dist.ends_at
        );

        // Only scheduled tests can be edited
        if (status !== "scheduled") {
            return { error: "DISTRIBUTION_NOT_EDITABLE" };
        }

        /* ---------------- Validate Time ---------------- */
        const start = new Date(input.starts_at);
        const end = new Date(input.ends_at);

        if (start >= end) {
            return { error: "INVALID_TIME_RANGE" };
        }

        /* ---------------- Update ---------------- */
        const { error } = await supabase
            .from("test_distributions")
            .update({
                batch_id: input.batch_id,
                starts_at: input.starts_at,
                ends_at: input.ends_at,
                duration_minutes: input.duration_minutes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", distributionId);

        if (error) {
            return { error: error.message };
        }
        updateTag(`distribution:${distributionId}`)

    } catch (err) {
        console.error("[UPDATE_TEST_DISTRIBUTION_ERROR]", err);
        return {
            error: "Failed to update distribution",
        };
    }
}
