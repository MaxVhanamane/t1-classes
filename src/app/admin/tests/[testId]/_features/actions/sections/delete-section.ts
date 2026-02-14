"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

export async function deleteSection(testId: string, sectionId: string) {

    await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    // Ownership check
    const { data: section } = await supabase
        .from("test_sections")
        .select("id, test_id")
        .eq("id", sectionId)
        .maybeSingle();

    if (!section || section.test_id !== testId) {
        throw new Error("SECTION_NOT_FOUND");
    }

    // Delete section (questions should cascade if FK is set correctly)
    const { error } = await supabase
        .from("test_sections")
        .delete()
        .eq("id", sectionId);

    if (error) {
        throw new Error("DELETE_FAILED");
    }
}
