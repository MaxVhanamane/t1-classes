"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

type SectionWithTest = {
    id: string;
    test_id: string;
    tests: {
        is_locked: boolean;
        created_by: string;
    };
};

export async function deleteSection(
    testId: string,
    sectionId: string
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {

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
            .single<SectionWithTest>();

        if (error || !data || data.test_id !== testId) {
            return { error: "Section not found" };
        }

        // Ownership check (teachers can only modify their tests)
        if (
            staff.role === "teacher" &&
            data.tests.created_by !== staff.userId
        ) {
            return { error: "You are not authorized to delete this section" };
        }

        // Lock check
        if (data.tests.is_locked) {
            return {
                error: "This test is locked and cannot be modified",
            };
        }

        // Delete section
        const { error: deleteError } = await supabase
            .from("test_sections")
            .delete()
            .eq("id", sectionId);

        if (deleteError) {
            console.error("[DELETE_SECTION_ERROR]", deleteError);
            return {
                error: "Failed to delete section. Please try again.",
            };
        }
    } catch (err) {
        console.error("[DELETE_SECTION_FATAL]", err);
        return {
            error: "Something went wrong. Please try again.",
        };
    }
}
