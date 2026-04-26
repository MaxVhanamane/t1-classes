"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

export async function extendDistribution(
    distributionId: string,
    newEndsAtISO: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {

        const supabase = await createServerSupabaseClient();

        // Fetch distribution
        const { data, error } = await supabase
            .from("test_distributions")
            .select("id, ends_at, created_by")
            .eq("id", distributionId)
            .maybeSingle();

        if (error || !data) {
            return { error: "Distribution not found" };
        }

        // Teacher can only extend their own
        if (staff.role !== "admin" && data.created_by !== staff.userId) {
            return { error: "You are not authorized to extend this test" };
        }

        const oldEnd = new Date(data.ends_at).getTime();
        const newEnd = new Date(newEndsAtISO).getTime();
        const now = Date.now();

        // Validation
        if (now > oldEnd) {
            return { error: "Test already completed" };
        }

        if (newEnd <= oldEnd) {
            return { error: "New end time must be later than the current end time" };
        }

        // Update distribution
        const { error: updateError } = await supabase
            .from("test_distributions")
            .update({
                ends_at: newEndsAtISO,
                updated_at: new Date().toISOString(),
            })
            .eq("id", distributionId);

        if (updateError) {
            console.error("[EXTEND_DISTRIBUTION_ERROR]", updateError);

            // Handle database constraint errors
            if (
                updateError.message.includes("no_overlapping_tests_per_batch")
            ) {
                return {
                    error:
                        "Cannot extend — another test is scheduled in this time window.",
                };
            }

            return {
                error: updateError.message || "Failed to extend test",
            };
        }

        revalidatePath("/admin/tests/distributions");

    } catch (err) {
        console.error("[EXTEND_DISTRIBUTION_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
