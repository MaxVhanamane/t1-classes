import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStudentServerOnly } from "@/src/lib/auth/require-role-server-only";

import { generateParticipantToken } from "@/src/app/admin/mentorship_sessions/_features/lib/videosdk/generate-participant-token";

interface GetStudentLiveSessionAccessParams {
    sessionId: string;
}

type StudentLiveSessionAccessResult =
    | { status: "not_started" }
    | { status: "ended" }
    | { status: "forbidden" }
    | {
        status: "allowed";

        meetingId: string;

        token: string;

        participantName: string;

        isModerator: false;

        isSessionOwner: false;

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

export const getStudentLiveSessionAccess = cache(
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

        /* ---------- Enrollment ---------- */

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

        /* ---------- RTC Token ---------- */

        const token = generateParticipantToken({
            isModerator: false,
        });

        return {
            status: "allowed",

            meetingId: session.meeting_id,

            token,

            participantName: profile?.full_name ?? "Student",

            isModerator: false,

            isSessionOwner: false,

            session,
        };
    },
);
