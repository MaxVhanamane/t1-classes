"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ScheduleTestInput } from "../zod/schedule-test.schema";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function createTestDistribution(
    input: ScheduleTestInput
): Promise<ServerActionResponse<string>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        if (!input.batch_id) {
            return { error: "Batch is required" };
        }

        const { error } = await supabase.rpc(
            "rpc_create_test_distribution",
            {
                p_test_id: input.test_id,
                p_batch_id: input.batch_id,
                p_starts_at: input.starts_at,
                p_ends_at: input.ends_at,
                p_duration_minutes: input.duration_minutes,
                p_created_by: staff.userId,
            }
        );

        if (error) {
            return { error: error.message };
        }


    } catch (err) {
        console.error("[CREATE_TEST_DISTRIBUTION_ERROR]", err);
        return {
            error: "Failed to create test distribution",
        };
    }
}
