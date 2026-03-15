"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

export async function deleteDistribution(distributionId: string) {
    const user = await getAuthIfHasRole(["admin", "teacher"]);
    if (!user) redirect("/login");

    const supabase = await createServerSupabaseClient();

    // delete distribution and unlock test if there is no other distribution using this test

    const { error } = await supabase.rpc("rpc_delete_test_distribution", {
        p_distribution_id: distributionId,
        p_user_id: user.userId,
        p_user_role: user.role,
    });

    if (error) {
        console.error("[DELETE_DISTRIBUTION]", error);
        throw new Error(error.message);
    }

    return { success: true };
}
