"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ScheduleTestInput } from "../zod/schedule-test.schema";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function createTestDistribution(input: ScheduleTestInput) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login")
    }
    const supabase = await createServerSupabaseClient();

    if (!input.batch_id) {
        throw new Error("Batch is required");
    }

    const { data, error } = await supabase.rpc("rpc_create_test_distribution", {
        p_test_id: input.test_id,
        p_batch_id: input.batch_id,
        p_starts_at: input.starts_at,
        p_ends_at: input.ends_at,
        p_duration_minutes: input.duration_minutes,
        p_created_by: user.userId,
    });
    if (error) {
        throw new Error(error.message);
    }

    return { success: true, distributionId: data };
}
