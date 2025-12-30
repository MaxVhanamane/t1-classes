"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";

export type UserAuditInfo = {
    id: string;
    full_name: string | null;
    role: "admin" | "teacher" | "student" | "parent";
    is_active: boolean;
}



export async function getUserAuditInfo(
    userId: string
): Promise<UserAuditInfo | null> {
    // 1. Authorization (single source of truth)
    await getCurrentAdmin();

    const supabase = await createServerSupabaseClient();

    // 2. Fetch user
    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, role, status")
        .eq("id", userId)
        .maybeSingle();


    // 3. Graceful fallback
    if (error || !data) {
        return null;
    }

    return {
        id: data.id,
        full_name: data.full_name,
        role: data.role,
        is_active: data.status === "active",
    };
}
