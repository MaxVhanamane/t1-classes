"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { ScheduleTestInput } from "../../../schedule/_features/zod/schedule-test.schema"
import { revalidatePath } from "next/cache"
import { computeDistributionStatus } from "../helpers/compute-distribution-status"

export async function updateTestDistribution(
    distributionId: string,
    input: ScheduleTestInput
) {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    /* ---------------- Fetch Distribution ---------------- */
    const { data: dist, error: fetchError } = await supabase
        .from("test_distributions")
        .select("id, created_by, starts_at, ends_at")
        .eq("id", distributionId)
        .single()

    if (fetchError || !dist) {
        throw new Error("DISTRIBUTION_NOT_FOUND")
    }

    /* ---------------- Permissions ---------------- */
    if (staff.role !== "admin" && dist.created_by !== staff.id) {
        throw new Error("NOT_AUTHORIZED")
    }

    /* ---------------- Status Check ---------------- */
    const status = computeDistributionStatus(
        dist.starts_at,
        dist.ends_at
    )

    // Only scheduled tests can be fully edited
    if (status !== "scheduled") {
        throw new Error("DISTRIBUTION_NOT_EDITABLE")
    }

    /* ---------------- Validate Time ---------------- */
    const start = new Date(input.starts_at)
    const end = new Date(input.ends_at)

    if (start >= end) {
        throw new Error("INVALID_TIME_RANGE")
    }

    /* ---------------- Audience Logic ---------------- */
    if (input.audience === "batch") {
        if (!input.batch_id || input.course_id) {
            throw new Error("INVALID_BATCH_SCOPE")
        }
    }

    if (input.audience === "course") {
        if (!input.course_id || input.batch_id) {
            throw new Error("INVALID_COURSE_SCOPE")
        }
    }

    if (input.audience === "marketing") {
        if (input.batch_id || input.course_id) {
            throw new Error("INVALID_MARKETING_SCOPE")
        }
    }

    /* ---------------- Update ---------------- */
    const { error } = await supabase
        .from("test_distributions")
        .update({
            audience: input.audience,
            batch_id: input.batch_id,
            course_id: input.course_id,
            starts_at: input.starts_at,
            ends_at: input.ends_at,
            duration_minutes: input.duration_minutes,
            max_attempts: input.max_attempts,
            updated_at: new Date().toISOString(),
        })
        .eq("id", distributionId)

    if (error) {
        console.error("[UPDATE_DISTRIBUTION]", error)
        throw new Error("FAILED_TO_UPDATE_DISTRIBUTION")
    }

    /* ---------------- Revalidate UI ---------------- */
    revalidatePath("/admin/tests/distributions")
    revalidatePath("/admin/tests/schedule")

    return { success: true }
}
