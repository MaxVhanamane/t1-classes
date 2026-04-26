"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { ServerActionResponse } from "@/src/types/server-action";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

type UpdateTestData = {
    title: string;
    description: string | null;
};

export async function updateTest(
    testId: string,
    data: UpdateTestData
): Promise<ServerActionResponse<{ id: string }>> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();
    try {

        if (!data.title.trim()) {
            return { error: "Title cannot be empty" };
        }

        const supabase = await createServerSupabaseClient();

        // Only allow editing your own test unless admin
        let query = supabase
            .from("tests")
            .update({
                title: data.title.trim(),
                description: data.description,
                updated_at: new Date().toISOString(),
            })
            .eq("id", testId);

        if (staff.role !== "admin") {
            query = query.eq("created_by", staff.userId);
        }

        const { data: result, error } = await query
            .select("id")
            .single();

        if (error || !result) {
            console.error("[UPDATE_TEST_ERROR]", error);
            return { error: "Failed to update test" };
        }

        return { data: result };
    } catch (err) {
        console.error("[UPDATE_TEST_FATAL]", err);
        return { error: "Something went wrong. Please try again." };
    }
}
