"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { revalidatePath } from "next/cache"
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function extendDistribution(
    distributionId: string,
    newEndsAtISO: string
) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login")
    }
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
    if (user.role !== "admin" && data.created_by !== user.userId) {
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
        throw new Error(updateError.message);
    }
    revalidatePath("/admin/tests/distributions")
    return { success: true }
}
