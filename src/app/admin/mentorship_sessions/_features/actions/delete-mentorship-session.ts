"use server";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

export async function deleteMentorshipSession(
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
                "mentorship_sessions",
            )
            .select(`
        id,
        starts_at,
        ends_at,
        meeting_id
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
                    "Mentorship session not found",
            };
        }

        /* ---------- Delete Rules ---------- */

        // const now =
        //     new Date();

        // const isLive =
        //     now >=
        //     new Date(
        //         session.starts_at,
        //     ) &&
        //     now <=
        //     new Date(
        //         session.ends_at,
        //     );

        // if (isLive) {
        //     return {
        //         error:
        //             "Live sessions cannot be deleted",
        //     };
        // }

        /* ---------- Delete ---------- */

        const {
            error:
            deleteError,
        } = await supabase
            .from(
                "mentorship_sessions",
            )
            .delete()
            .eq("id", sessionId);

        if (deleteError) {
            console.error(
                "[DELETE_MENTORSHIP_SESSION_ERROR]",
                deleteError,
            );

            return {
                error:
                    "Failed to delete mentorship session",
            };
        }




    } catch (error) {
        console.error(
            "[DELETE_MENTORSHIP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
