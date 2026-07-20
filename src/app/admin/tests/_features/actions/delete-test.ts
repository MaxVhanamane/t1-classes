"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

export async function deleteTest(
    testId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {


        const supabase = await createServerSupabaseClient();

        // Fetch test
        const { data: test, error: fetchError } = await supabase
            .from("tests")
            .select("id, created_by, is_locked")
            .eq("id", testId)
            .maybeSingle();

        if (fetchError || !test) {
            return { error: "Test not found" };
        }

        // Locked = hard stop
        if (test.is_locked) {
            return { error: "This test is locked and cannot be deleted" };
        }

        // Teacher can only delete their own tests
        if (staff.role !== "admin" && test.created_by !== staff.userId) {
            return { error: "You are not authorized to delete this test" };
        }

        // Delete test
        const { error: deleteError } = await supabase
            .from("tests")
            .delete()
            .eq("id", testId);

        if (deleteError) {
            console.error("[DELETE_TEST_ERROR]", deleteError);
            return { error: "Failed to delete test. Please try again." };
        }


    } catch (error) {
        console.error("[DELETE_TEST_FATAL]", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
