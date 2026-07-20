"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteGroupSession(
    sessionId: string,
): Promise<
    ServerActionResponse<void>
> {
    /* ---------- Auth ---------- */

    const staff =
        await requireStaffServerOnly();

    try {
        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Existing Session ---------- */

        let query = supabase
            .from(
                "group_sessions",
            )
            .select(`
        id
      `)
            .eq("id", sessionId);

        /* ---------- Teacher Scope ---------- */

        if (
            staff.role ===
            "teacher"
        ) {
            query = query.eq(
                "created_by",
                staff.userId,
            );
        }

        const {
            data: session,
            error:
            sessionError,
        } = await query
            .maybeSingle();

        if (
            sessionError ||
            !session
        ) {
            return {
                error:
                    "Group session not found",
            };
        }

        /* ---------- Delete ---------- */

        const {
            error:
            deleteError,
        } = await supabase
            .from(
                "group_sessions",
            )
            .delete()
            .eq("id", sessionId);

        if (deleteError) {
            console.error(
                "[DELETE_GROUP_SESSION_ERROR]",
                deleteError,
            );

            return {
                error:
                    "Failed to delete group session",
            };
        }


    } catch (error) {
        console.error(
            "[DELETE_GROUP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
