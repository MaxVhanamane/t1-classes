"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";

export async function resendInvite(userId: string) {
    // 1 Verify admin
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: admin } = await supabase
        .from("users")
        .select("role, status")
        .eq("id", user.id)
        .single();

    if (!admin || admin.role !== "admin" || admin.status !== "active") {
        throw new Error("Not authorized");
    }

    // 2 Get target user's email from auth
    const adminSupabase = await createServiceRoleSupabaseClient();

    const { data: authUser, error } =
        await adminSupabase.auth.admin.getUserById(userId);

    if (error || !authUser.user?.email) {
        throw new Error("User email not found");
    }

    // 3 Re-invite
    await adminSupabase.auth.admin.inviteUserByEmail(authUser.user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });

    revalidatePath("/admin/users");
}
