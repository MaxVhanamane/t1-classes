"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { createVideoSdkMeeting } from "../lib/videosdk/create-meeting";

export async function startMentorshipSession(sessionId: string) {
    try {
        await requireStaffServerOnly();

        const supabase = await createServerSupabaseClient();

        const { data: session, error } = await supabase
            .from("mentorship_sessions")
            .select(`
        id,
        starts_at,
        ends_at,
        meeting_id,
        created_by
      `)
            .eq("id", sessionId)
            .single();

        if (error || !session) {
            return {
                error: "Session not found",
            };
        }

        const now = new Date();
        const startsAt = new Date(session.starts_at);
        const endsAt = new Date(session.ends_at);

        // 5-minute buffer check
        const startWindow = new Date(startsAt.getTime() - 5 * 60 * 1000);

        if (now < startWindow) {
            return {
                error: "Session can only be started 5 minutes before start time",
            };
        }

        if (now > endsAt) {
            return {
                error: "Session has already ended",
            };
        }

        // If it already has a meeting_id, it means it was already started. Return early.
        if (session.meeting_id) {
            return {
                data: {
                    meetingId: session.meeting_id,
                },
            };
        }

        let meetingId: string;

        // Toggle logic based on your environment variable
        // Set this in your .env file: NEXT_PUBLIC_VIDEO_PROVIDER="agora" (or "videosdk")
        const videoProvider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER || "agora";

        if (videoProvider === "videosdk") {
            // For VideoSDK: Call external API to provision room

            meetingId = await createVideoSdkMeeting();
        } else {

            // For Agora: Generate a pristine, unique UUID for the channel name instantly
            meetingId = crypto.randomUUID();
        }

        // Update the database to lock in the new meeting_id
        const { error: updateError } = await supabase
            .from("mentorship_sessions")
            .update({
                meeting_id: meetingId,
            })
            .eq("id", sessionId);

        if (updateError) {
            return {
                error: updateError.message,
            };
        }

        return {
            data: {
                meetingId,
            },
        };
    } catch (error) {
        console.error("[START_MENTORSHIP_SESSION_ERROR]", error);

        return {
            error: "Failed to start mentorship session",
        };
    }
}
