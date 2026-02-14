"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"

export async function deleteDistribution(distributionId: string) {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    // Fetch distribution
    const { data, error: fetchError } = await supabase
        .from("test_distributions")
        .select("id, created_by, starts_at, ends_at")
        .eq("id", distributionId)
        .maybeSingle()

    if (fetchError || !data) {
        throw new Error("DISTRIBUTION_NOT_FOUND")
    }

    // Only allow delete if still scheduled
    const now = Date.now()
    const start = new Date(data.starts_at).getTime()

    if (now >= start) {
        throw new Error("DISTRIBUTION_ALREADY_STARTED")
    }

    // Teacher can only delete their own
    if (staff.role !== "admin" && data.created_by !== staff.id) {
        throw new Error("NOT_AUTHORIZED")
    }

    const { error } = await supabase
        .from("test_distributions")
        .delete()
        .eq("id", distributionId)

    if (error) {
        console.error("[DELETE_DISTRIBUTION]", error)
        throw new Error("FAILED_TO_DELETE_DISTRIBUTION")
    }

    return { success: true }
}
