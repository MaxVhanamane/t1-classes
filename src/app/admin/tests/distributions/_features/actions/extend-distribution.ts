"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { revalidatePath } from "next/cache"

export async function extendDistribution(
    distributionId: string,
    newEndsAtISO: string
) {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    // Fetch distribution
    const { data, error } = await supabase
        .from("test_distributions")
        .select("id, ends_at, created_by")
        .eq("id", distributionId)
        .maybeSingle()

    if (error || !data) {
        throw new Error("DISTRIBUTION_NOT_FOUND")
    }

    // Teacher can only extend their own
    if (staff.role !== "admin" && data.created_by !== staff.id) {
        throw new Error("NOT_AUTHORIZED")
    }

    const oldEnd = new Date(data.ends_at).getTime()
    const newEnd = new Date(newEndsAtISO).getTime()
    const now = Date.now()

    // Validation
    if (now > oldEnd) {
        throw new Error("TEST_ALREADY_COMPLETED")
    }

    if (newEnd <= oldEnd) {
        throw new Error("MUST_EXTEND_TIME")
    }

    const { error: updateError } = await supabase
        .from("test_distributions")
        .update({
            ends_at: newEndsAtISO,
            updated_at: new Date().toISOString(),
        })
        .eq("id", distributionId)

    if (updateError) {
        console.error("[EXTEND_DISTRIBUTION]", updateError)
        throw new Error("FAILED_TO_EXTEND")
    }
    revalidatePath("/admin/tests/distributions")
    return { success: true }
}
