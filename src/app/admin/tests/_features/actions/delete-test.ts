"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteTest(testId: string) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login");
    }

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
    if (user.role !== "admin" && test.created_by !== user.userId) {
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
    revalidatePath("/admin/tests")
    return { success: true };
}
