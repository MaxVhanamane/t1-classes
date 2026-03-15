"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";
type SectionWithTest = {
    id: string
    test_id: string
    tests: {
        is_locked: boolean
        created_by: string
    }
}
export async function deleteSection(testId: string, sectionId: string) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) {
        redirect("/login");
    }

    const supabase = await createServerSupabaseClient();

    // Fetch section + test lock status in one query
    const { data, error } = await supabase
        .from("test_sections")
        .select(`
    id,
    test_id,
    tests (
      is_locked,
      created_by
    )
  `)
        .eq("id", sectionId)
        .single<SectionWithTest>()


    if (error || !data || data.test_id !== testId) {
        throw new Error("SECTION_NOT_FOUND");
    }

    // Ownership check (teachers can only modify their tests)
    if (user.role === "teacher" && data.tests.created_by !== user.userId) {
        throw new Error("UNAUTHORIZED");
    }

    // Lock check
    if (data.tests.is_locked) {
        throw new Error("TEST_LOCKED");
    }

    // Delete section
    const { error: deleteError } = await supabase
        .from("test_sections")
        .delete()
        .eq("id", sectionId);

    if (deleteError) {
        throw new Error("DELETE_FAILED");
    }
}
