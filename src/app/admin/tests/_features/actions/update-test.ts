"use server";

import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { redirect } from "next/navigation";



export async function updateTest(
    testId: string,
    data: {
        title: string;
        description: string | null;
    }
) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        redirect("/login");
    }

    const supabase = await createServerSupabaseClient();

    //Only allow editing your own test unless admin
    const query = supabase
        .from("tests")
        .update({
            title: data.title,
            description: data.description,
            updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

    if (user.role !== "admin") {
        query.eq("created_by", user.userId);
    }

    const { error, data: result } = await query.select().single();

    if (error) {
        console.error("UPDATE TEST ERROR:", error);
        throw new Error("Failed to update test");
    }

    return result;
}
