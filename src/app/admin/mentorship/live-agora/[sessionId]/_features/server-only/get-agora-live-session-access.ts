"use server";

import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { generateAgoraToken } from "./generate-agora-token";

// Strictly typed session matching your table definition
export interface Session {
    id: string;
    title: string;
    description: string | null;
    meeting_id: string | null;
    starts_at: string;
    ends_at: string;
    created_by: string;
}

export type LiveSessionAccessResult =
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
        numericUid: number;
        session: Session;
    };

interface GetLiveSessionAccessParams {
    sessionId: string;
}

export const getAgoraLiveSessionAccess = cache(
    async ({ sessionId }: GetLiveSessionAccessParams): Promise<LiveSessionAccessResult> => {
        const supabase = await createServerSupabaseClient();
        const user = await requireStaffServerOnly();

        if (!user) return { status: "forbidden" };

        const { data: profile } = await supabase
            .from("users")
            .select("id, full_name, role")
            .eq("id", user.userId)
            .single();

        const { data: session } = await supabase
            .from("mentorship_sessions")
            .select("id, title, description, meeting_id, starts_at, ends_at, created_by")
            .eq("id", sessionId)
            .single().overrideTypes<Session>();

        if (!session) notFound();

        if (!session) notFound();

        // 1. Time-based status checks
        const now = new Date();
        if (session.ends_at && now > new Date(session.ends_at)) return { status: "ended" };
        if (!session.meeting_id) return { status: "not_started" };

        // 2. Role definition
        const isSessionOwner = session.created_by === user.userId;
        const isModerator = profile?.role === "admin" || isSessionOwner;

        // 3. Generate Agora-specific token
        const numericUid = generateSessionUid();
        const token = generateAgoraToken(
            session.meeting_id,
            numericUid,
            isModerator
        );

        return {
            status: "allowed",
            meetingId: session.meeting_id,
            token,
            numericUid,
            participantName: profile?.full_name ?? "Participant",
            isModerator,
            isSessionOwner,
            session: session,
        };
    }
);


function generateSessionUid(): number {
    // 31-bit random int — Agora UIDs must fit in a 32-bit unsigned int,
    // keeping it under 0x7fffffff avoids any signed/unsigned edge cases
    return Math.floor(Math.random() * 0x7fffffff);
}
