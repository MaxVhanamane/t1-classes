"use server";

import {
    revalidatePath,
} from "next/cache";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminServerOnly } from "@/src/lib/auth/require-role-server-only";

import type {
    ServerActionResponse,
} from "@/src/types/server-action";

export async function toggleMentorshipSessions(
    enabled: boolean,
): Promise<
    ServerActionResponse<boolean>
> {
    /* ---------- Auth ---------- */

    const admin =
        await requireAdminServerOnly();

    try {
        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        const { error } = await supabase
            .from("platform_settings")
            .update({
                value: enabled,

                updated_by: admin.userId,
            })
            .eq(
                "key",
                "mentorship_sessions_enabled",
            );

        if (error) {
            console.error(
                "[TOGGLE_MENTORSHIP_SESSIONS_ERROR]",
                error,
            );

            return {
                error:
                    "Failed to update mentorship session setting.",
            };
        }

        /* ---------- Revalidate ---------- */

        revalidatePath(
            "/admin/mentorship_sessions",
        );

        return {
            data: enabled,
        };
    } catch (error) {
        console.error(
            "[TOGGLE_MENTORSHIP_SESSIONS_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
