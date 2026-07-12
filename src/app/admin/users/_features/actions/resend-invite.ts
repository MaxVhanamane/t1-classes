"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function resendInvite(
    userId: string,
): Promise<ServerActionResponse> {
    /* ---------------------------------------- */
    /* Auth                                     */
    /* ---------------------------------------- */
    await requireAdminServerOnly();

    try {
        /* ---------------------------------------- */
        /* Validate                                 */
        /* ---------------------------------------- */
        if (!userId) {
            return { error: "User ID is required" };
        }

        /* ---------------------------------------- */
        /* Supabase                                 */
        /* ---------------------------------------- */
        const supabase = await createServiceRoleSupabaseClient();

        /* ---------------------------------------- */
        /* Safety Check: Public Profile             */
        /* ---------------------------------------- */
        const { data: publicUser, error: publicError } = await supabase
            .from("users")
            .select("status")
            .eq("id", userId)
            .single();

        if (publicError || !publicUser) {
            return { error: "Could not verify the user's current status." };
        }

        if (publicUser.status === "active") {
            return { error: "This student has already activated their account." };
        }

        /* ---------------------------------------- */
        /* Get Auth User                            */
        /* ---------------------------------------- */
        const {
            data: authUser,
            error: authError,
        } = await supabase.auth.admin.getUserById(userId);

        if (authError || !authUser.user?.email) {
            return { error: "User email not found in the authentication system." };
        }

        const email = authUser.user.email.trim().toLowerCase();

        /* ---------------------------------------- */
        /* Reinvite Routing Logic                   */
        /* ---------------------------------------- */
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

        if (!SITE_URL) {
            return { error: "NEXT_PUBLIC_SITE_URL is not set" };
        }

        const redirectTo = new URL("/auth/callback", SITE_URL).toString();

        // Check the exact database state you discovered:
        const hasClickedLinkBefore = !!authUser.user.email_confirmed_at;

        if (hasClickedLinkBefore) {
            // STATE 2: User clicked the link, but abandoned the setup form.
            // GoTrue considers them "registered", so we must use the Recovery flow.
            const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
                email,
                { redirectTo }
            );

            if (recoveryError) {
                return { error: recoveryError.message || "Failed to send new setup link." };
            }
        } else {
            // STATE 1: User never clicked the original email.
            // GoTrue considers them "unregistered", so native invite works perfectly.
            const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                email,
                { redirectTo }
            );

            if (inviteError) {
                return { error: inviteError.message || "Failed to resend invite." };
            }
        }


    } catch (error) {
        console.error("[RESEND_INVITE_ERROR]", error);

        return {
            error: "An unexpected error occurred while resending the invite.",
        };
    }
}
