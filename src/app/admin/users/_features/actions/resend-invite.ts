"use server";

import { revalidatePath } from "next/cache";

import {
    createServiceRoleSupabaseClient,
} from "@/src/lib/supabase/supabase-service-role";

import {
    requireAdminServerOnly,
} from "@/src/lib/auth/require-role-server-only";

import {
    ServerActionResponse,
} from "@/src/types/server-action";

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
            return {
                error:
                    "User ID is required",
            };
        }

        /* ---------------------------------------- */
        /* Supabase                                 */
        /* ---------------------------------------- */

        const supabase =
            await createServiceRoleSupabaseClient();

        /* ---------------------------------------- */
        /* Get User                                 */
        /* ---------------------------------------- */

        const {
            data: authUser,
            error: authError,
        } =
            await supabase.auth.admin.getUserById(
                userId,
            );

        if (
            authError ||
            !authUser.user?.email
        ) {
            return {
                error:
                    "User email not found",
            };
        }

        const email =
            authUser.user.email
                .trim()
                .toLowerCase();

        /* ---------------------------------------- */
        /* Reinvite                                 */
        /* ---------------------------------------- */

        const {
            error: inviteError,
        } =
            await supabase.auth.admin.inviteUserByEmail(
                email,
                {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                },
            );

        if (inviteError) {
            return {
                error:
                    inviteError.message ||
                    "Failed to resend invite",
            };
        }

        /* ---------------------------------------- */
        /* Revalidate                               */
        /* ---------------------------------------- */

        revalidatePath(
            "/admin/users",
        );


    } catch (error) {
        console.error(
            "[RESEND_INVITE_ERROR]",
            error,
        );

        return {
            error:
                "Failed to resend invite",
        };
    }
}
