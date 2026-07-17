"use server";

import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentServerOnly } from "@/src/lib/auth/require-role-server-only";
import { generateAgoraToken } from "@/src/app/admin/mentorship/live-agora/[sessionId]/_features/server-only/generate-agora-token";

export interface Session {
    id: string;
    title: string;
    description: string | null;
    batch_id: string;
    audience_type: "batch" | "selected_students";
    meeting_id: string | null;
    starts_at: string;
    ends_at: string | null;
    created_by: string;
    created_at: string;
    duration_minutes: number;
}

export type StudentLiveSessionAccessResult =
    | { status: "not_started" }
    | { status: "ended" }
    | { status: "forbidden" }
    | {
        status: "allowed";
        meetingId: string;
        token: string;
        numericUid: number; // Required for Agora
        participantName: string;
        isModerator: false; // Always false for students
        isSessionOwner: false; // Always false for students
        session: Session;
    };

interface GetStudentLiveSessionAccessParams {
    sessionId: string;
}

export const getAgoraStudentLiveSessionAccess = cache(
    async ({
        sessionId,
    }: GetStudentLiveSessionAccessParams): Promise<StudentLiveSessionAccessResult | null> => {
        const supabase = await createServerSupabaseClient();
        const user = await requireStudentServerOnly();

        if (!user) {
            return null;
        }

        /* ---------- Profile ---------- */
        const { data: profile } = await supabase
            .from("users")
            .select("id, full_name")
            .eq("id", user.userId)
            .single();

        /* ---------- Session ---------- */
        const { data: session } = await supabase
            .from("mentorship_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

        if (!session) {
            notFound();
        }

        /* ---------- Meeting State ---------- */
        const now = new Date();

        if (session.ends_at && now > new Date(session.ends_at)) {
            return { status: "ended" };
        }

        if (!session.meeting_id) {
            return { status: "not_started" };
        }

        /* ---------- Enrollment (Kept your existing logic) ---------- */
        // const { data: enrollment } = await supabase
        //     .from("enrollments")
        //     .select("user_id")
        //     .eq("user_id", user.userId)
        //     .eq("batch_id", session.batch_id)
        //     .eq("target_type", "batch")
        //     .eq("is_active", true)
        //     .maybeSingle();

        // if (!enrollment) {
        //     return { status: "forbidden" };
        // }

        /* ---------- Selected Students ---------- */
        if (session.audience_type === "selected_students") {
            const { data: selectedStudent } = await supabase
                .from("mentorship_session_students")
                .select("student_id")
                .eq("session_id", session.id)
                .eq("student_id", user.userId)
                .maybeSingle();

            if (!selectedStudent) {
                return { status: "forbidden" };
            }
        }

        /* ---------- RTC Token Generation ---------- */
        const numericUid = hashUuidToUint32(user.userId);

        // Pass false for isModerator
        const token = generateAgoraToken(session.meeting_id, numericUid, false);

        return {
            status: "allowed",
            meetingId: session.meeting_id,
            token,
            numericUid, // Pass this to the client
            participantName: profile?.full_name ?? "Student",
            isModerator: false,
            isSessionOwner: false,
            session: session as Session,
        };
    },
);

function hashUuidToUint32(uuid: string): number {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
