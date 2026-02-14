"use server";

import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";



export async function updateTest(
    testId: string,
    data: {
        title: string;
        description: string | null;
    }
) {
    const user = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    // Optional: Only allow editing your own test unless admin
    const query = supabase
        .from("tests")
        .update({
            title: data.title,
            description: data.description,
            updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

    if (user.role !== "admin") {
        query.eq("created_by", user.id);
    }

    const { error, data: result } = await query.select().single();

    if (error) {
        console.error("UPDATE TEST ERROR:", error);
        throw new Error("Failed to update test");
    }

    return result;
}
