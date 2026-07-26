"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { deleteSectionSchema } from "../zod/syllabus-progress.schema";

export async function deleteSection(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    const staff = await requireStaffServerOnly();

    // Extra security check: only admins can delete sections
    if (staff.role !== "admin") {
        return { error: "Only admins can delete sections" };
    }

    try {
        const parsed = deleteSectionSchema.safeParse(input);
        if (!parsed.success) return { error: "Invalid data" };

        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("batch_progress_sections")
            .delete()
            .eq("id", parsed.data.section_id);

        if (error) {
            console.error("[DELETE_SECTION_ERROR]", error);
            return { error: "Failed to delete section" };
        }

        return { data: true };
    } catch (error) {
        console.error("[DELETE_SECTION_FATAL]", error);
        return { error: "Something went wrong." };
    }
}
