import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { generateParticipantToken } from "../lib/videosdk/generate-participant-token";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

interface GetLiveSessionAccessParams {
    sessionId: string;
}

type LiveSessionAccessResult =
    | { status: "not_started" }
    | { status: "ended" }
    | { status: "forbidden" }
    | {
        status: "allowed";

        meetingId: string;
        token: string;

        participantName: string;

        isModerator: boolean;
        isSessionOwner: boolean;

        session: {
            id: string;
            title: string;

            meeting_id: string | null;

            starts_at: string;
            ends_at: string;

            audience_type: "batch" | "selected_students";

            batch_id: string;
            created_by: string;
        };
    };

export const getLiveSessionAccess = cache(
    async ({
        sessionId,
    }: GetLiveSessionAccessParams): Promise<LiveSessionAccessResult | null> => {
        const supabase = await createServerSupabaseClient();

        const user = await requireStaffServerOnly()

        if (!user) {
            return null;
        }

        /* ---------- Profile ---------- */

        const { data: profile } = await supabase
            .from("users")
            .select(`
        id,
        full_name,
        role
      `)
            .eq("id", user.userId)
            .single();

        /* ---------- Session ---------- */

        const { data: session } = await supabase
            .from("mentorship_sessions")
            .select(`
        id,
        title,
        meeting_id,
        starts_at,
        ends_at,
        audience_type,
        batch_id,
        created_by
      `)
            .eq("id", sessionId)
            .single();

        if (!session) {
            notFound();
        }


        /* ---------- Meeting State ---------- */

        const now = new Date();

        if (now > new Date(session.ends_at)) {
            return { status: "ended" };
        }

        if (!session.meeting_id) {
            return { status: "not_started" };
        }
        /* ---------- Meeting Roles ---------- */

        const isSessionOwner =
            session.created_by ===
            user.userId;

        const isModerator =
            profile?.role === "admin" ||
            isSessionOwner;


        /* ---------- RTC Token ---------- */

        const token = generateParticipantToken({
            isModerator,
        });

        return {
            status: "allowed",

            meetingId: session.meeting_id,

            token,

            participantName: profile?.full_name ?? "Participant",

            isModerator,
            isSessionOwner,

            session,
        };
    },
);
