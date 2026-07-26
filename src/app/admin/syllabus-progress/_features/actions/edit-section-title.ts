"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import { editSectionTitleSchema, EditSectionTitleInput } from "../zod/syllabus-progress.schema";

export async function editSectionTitle(
    input: unknown
): Promise<ServerActionResponse<boolean>> {
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can edit section titles" };
    }

    try {
        const parsed = editSectionTitleSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message ?? "Invalid title data",
            };
        }

        const values = input as EditSectionTitleInput;
        const supabase = await createServerSupabaseClient();

        const { error: updateError } = await supabase
            .from("batch_progress_sections")
            .update({ title: values.title })
            .eq("id", values.section_id);

        if (updateError) {
            console.error("[EDIT_SECTION_TITLE_ERROR]", updateError);
            return { error: "Failed to update section title" };
        }

        return { data: true };

    } catch (error) {
        console.error("[EDIT_SECTION_TITLE_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
