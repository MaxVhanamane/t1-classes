"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function deleteTest(testId: string) {
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    // Fetch test
    const { data: test, error: fetchError } = await supabase
        .from("tests")
        .select("id, created_by, is_locked")
        .eq("id", testId)
        .maybeSingle();

    if (fetchError || !test) {
        throw new Error("TEST_NOT_FOUND");
    }

    // Locked = hard stop
    if (test.is_locked) {
        throw new Error("TEST_LOCKED");
    }

    // Teacher can only delete own tests
    if (staff.role !== "admin" && test.created_by !== staff.id) {
        throw new Error("NOT_AUTHORIZED");
    }

    // Delete
    const { error: deleteError } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId);

    if (deleteError) {
        console.error("[DELETE_TEST_ERROR]", deleteError);
        throw new Error("FAILED_TO_DELETE_TEST");
    }

    return { success: true };
}
