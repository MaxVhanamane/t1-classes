"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

interface EndMentorshipSessionInput {
    sessionId: string;
}

export async function endMentorshipSession(
    input: EndMentorshipSessionInput,
): Promise<ServerActionResponse<boolean>> {
    /* ---------- Auth ---------- */

    const staff =
        await requireStaffServerOnly();

    try {
        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Session ---------- */

        const {
            data: session,
            error: sessionError,
        } = await supabase
            .from(
                "mentorship_sessions",
            )
            .select(`
        id,
        created_by,
        meeting_id,
        ends_at
      `)
            .eq(
                "id",
                input.sessionId,
            )
            .single();

        if (
            sessionError ||
            !session
        ) {
            console.error(
                "[END_MENTORSHIP_SESSION_FETCH_ERROR]",
                sessionError,
            );

            return {
                error:
                    "Mentorship session not found",
            };
        }

        /* ---------- Permission ---------- */

        const isModerator =
            session.created_by ===
            staff.userId;

        if (!isModerator) {
            return {
                error:
                    "You do not have permission to end this meeting",
            };
        }

        /* ---------- Already Ended ---------- */

        const nowDate =
            new Date();

        if (
            nowDate >
            new Date(
                session.ends_at,
            )
        ) {
            return {
                error:
                    "Meeting already ended",
            };
        }

        /* ---------- End Session ---------- */

        const now =
            nowDate.toISOString();

        const {
            error: updateError,
        } = await supabase
            .from(
                "mentorship_sessions",
            )
            .update({
                ends_at: now,
            })
            .eq(
                "id",
                input.sessionId,
            );

        if (updateError) {
            console.error(
                "[END_MENTORSHIP_SESSION_UPDATE_ERROR]",
                updateError,
            );

            return {
                error:
                    "Failed to end mentorship session",
            };
        }

        return {
            data: true,
        };
    } catch (error) {
        console.error(
            "[END_MENTORSHIP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
