"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { createVideoSdkMeeting } from "../lib/videosdk/create-meeting";


export async function startMentorshipSession(
    sessionId: string,
) {
    try {

        await requireStaffServerOnly();

        const supabase =
            await createServerSupabaseClient();

        const { data: session, error } =
            await supabase
                .from("mentorship_sessions")
                .select(
                    `
          id,
          starts_at,
          ends_at,
          meeting_id,
          created_by
        `,
                )
                .eq("id", sessionId)
                .single();

        if (error || !session) {
            return {
                error: "Session not found",
            };
        }

        const now = new Date();

        const startsAt = new Date(
            session.starts_at,
        );

        const endsAt = new Date(
            session.ends_at,
        );

        const startWindow = new Date(
            startsAt.getTime() -
            5 * 60 * 1000,
        );

        if (now < startWindow) {
            return {
                error:
                    "Session can only be started 5 minutes before start time",
            };
        }

        if (now > endsAt) {
            return {
                error:
                    "Session has already ended",
            };
        }

        if (session.meeting_id) {
            return {
                data: {
                    meetingId:
                        session.meeting_id,
                },
            };
        }

        const meetingId =
            await createVideoSdkMeeting();

        const { error: updateError } =
            await supabase
                .from("mentorship_sessions")
                .update({
                    meeting_id: meetingId,
                })
                .eq("id", sessionId);

        if (updateError) {
            return {
                error:
                    updateError.message,
            };
        }

        revalidatePath("/admin/mentorship");

        return {
            data: {
                meetingId,
            },
        };
    } catch (error) {
        console.error(
            "[START_MENTORSHIP_SESSION_ERROR]",
            error,
        );

        return {
            error:
                "Failed to start mentorship session",
        };
    }
}
