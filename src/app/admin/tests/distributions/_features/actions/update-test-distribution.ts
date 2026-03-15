"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ScheduleTestInput } from "../../../schedule/_features/zod/schedule-test.schema";
import { revalidatePath } from "next/cache";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function updateTestDistribution(
    distributionId: string,
    input: ScheduleTestInput
) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        redirect("/login");
    }

    const supabase = await createServerSupabaseClient();

    /* ---------------- Fetch Distribution ---------------- */

    const { data: dist, error: fetchError } = await supabase
        .from("test_distributions")
        .select("id, created_by, starts_at, ends_at")
        .eq("id", distributionId)
        .single();

    if (fetchError || !dist) {
        throw new Error("DISTRIBUTION_NOT_FOUND");
    }

    /* ---------------- Permissions ---------------- */

    if (user.role !== "admin" && dist.created_by !== user.userId) {
        throw new Error("NOT_AUTHORIZED");
    }

    /* ---------------- Status Check ---------------- */

    const status = computeDistributionStatus(dist.starts_at, dist.ends_at);

    // Only scheduled tests can be edited
    if (status !== "scheduled") {
        throw new Error("DISTRIBUTION_NOT_EDITABLE");
    }

    /* ---------------- Validate Time ---------------- */

    const start = new Date(input.starts_at);
    const end = new Date(input.ends_at);

    if (start >= end) {
        throw new Error("INVALID_TIME_RANGE");
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
        throw new Error(error.message);
    }
    /* ---------------- Revalidate UI ---------------- */

    revalidatePath("/admin/tests/distributions");
    revalidatePath("/admin/tests/schedule");

    return { success: true };
}
