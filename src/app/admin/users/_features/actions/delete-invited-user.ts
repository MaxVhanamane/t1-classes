"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteInvitedUser(userId: string): Promise<ServerActionResponse> {
    await requireAdminServerOnly();

    try {
        if (!userId) {
            return { error: "User ID is required" };
        }

        const supabaseAdmin = await createServiceRoleSupabaseClient();

        /* ---------------------------------------- */
        /* STATE MACHINE GATEKEEPER                 */
        /* ---------------------------------------- */
        const { data: user, error: fetchError } = await supabaseAdmin
            .from("users")
            .select("status")
            .eq("id", userId)
            .single();

        if (fetchError || !user) {
            return { error: "User not found in the database." };
        }

        // THE RULE: Only pending invitations can be hard-deleted.
        if (user.status !== "invited") {
            return {
                error: "Security Check: You cannot hard-delete an onboarded user. Please change their status to Blocked instead.",
            };
        }

        /* ---------------------------------------- */
        /* Execute Hard Delete                      */
        /* ---------------------------------------- */
        // Because you have ON DELETE CASCADE set up in Postgres, 
        // deleting them from auth.users automatically wipes them from public.users
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("[DELETE_USER_ERROR]", deleteError);
            return { error: deleteError.message || "Failed to delete the invitation." };
        }


    } catch (error) {
        console.error("[DELETE_USER_CATCH_ERROR]", error);
        return { error: "An unexpected error occurred while deleting the user." };
    }
}
