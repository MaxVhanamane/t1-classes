"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";
import { createSectionSchema, CreateSectionInput } from "../zod/syllabus-progress.schema";

export async function createSection(
    input: unknown
): Promise<ServerActionResponse<string>> {
    const staff = await requireStaffServerOnly();

    if (staff.role !== "admin") {
        return { error: "Only admins can create sections" };
    }

    try {
        const parsed = createSectionSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message ?? "Invalid section data",
            };
        }

        const values = input as CreateSectionInput;
        const supabase = await createServerSupabaseClient();

        // 1. Get the current highest sort_order for this batch
        const { data: highestSection } = await supabase
            .from("batch_progress_sections")
            .select("sort_order")
            .eq("batch_id", values.batch_id)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        // If a section exists, add 1. Otherwise, start at 1.
        const nextSortOrder = highestSection ? highestSection.sort_order + 1 : 1;

        // 2. Insert the new section
        const { data, error } = await supabase
            .from("batch_progress_sections")
            .insert({
                batch_id: values.batch_id,
                title: values.title,
                sort_order: nextSortOrder,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("[CREATE_SECTION_ERROR]", error);
            return { error: "Failed to create section" };
        }

        return { data: data.id };
    } catch (error) {
        console.error("[CREATE_SECTION_FATAL]", error);
        return { error: "Something went wrong. Please try again." };
    }
}
