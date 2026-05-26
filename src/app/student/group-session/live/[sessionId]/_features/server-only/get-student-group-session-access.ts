import "server-only";

import { cache } from "react";

import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStudentServerOnly } from "@/src/lib/auth/require-role-server-only";

interface GetStudentGroupSessionAccessParams {
    sessionId: string;
}

type StudentGroupSessionAccessResult =
    | {
        status: "not_started";
    }

    | {
        status: "ended";
    }

    | {
        status: "forbidden";
    }

    | {
        status: "allowed";

        joinUrl: string;
        externalJoinUrl: string;
        session: {
            id: string;

            title: string;

            description: string | null;

            starts_at: string;

            audience_type:
            | "batch"
            | "selected_students";

            batch_id: string;

            created_by: string;

            meeting_id: string | null;

            meeting_pwd: string | null;

            expected_duration_minutes: number | null;
        };
    };

export const getStudentGroupSessionAccess =
    cache(
        async ({
            sessionId,
        }: GetStudentGroupSessionAccessParams): Promise<StudentGroupSessionAccessResult | null> => {
            const supabase =
                await createServerSupabaseClient();

            const user =
                await requireStudentServerOnly();

            if (!user) {
                return null;
            }

            /* ---------- Session ---------- */

            const {
                data: session,
            } = await supabase
                .from(
                    "group_sessions",
                )
                .select(
                    `
          id,
          title,
          description,
          starts_at,
          audience_type,
          batch_id,
          created_by,
          meeting_id,
          meeting_pwd,
          expected_duration_minutes
        `,
                )
                .eq(
                    "id",
                    sessionId,
                )
                .single();

            if (!session) {
                notFound();
            }

            /* ---------- Enrollment ---------- */

            const {
                data: enrollment,
            } = await supabase
                .from(
                    "enrollments",
                )
                .select("id")
                .eq(
                    "user_id",
                    user.userId,
                )
                .eq(
                    "batch_id",
                    session.batch_id,
                )
                .eq(
                    "target_type",
                    "batch",
                )
                .eq(
                    "is_active",
                    true,
                )
                .maybeSingle();

            if (!enrollment) {
                return {
                    status:
                        "forbidden",
                };
            }

            /* ---------- Selected Students ---------- */

            if (
                session.audience_type ===
                "selected_students"
            ) {
                const {
                    data:
                    selectedStudent,
                } = await supabase
                    .from(
                        "group_session_students",
                    )
                    .select(
                        "student_id",
                    )
                    .eq(
                        "session_id",
                        session.id,
                    )
                    .eq(
                        "student_id",
                        user.userId,
                    )
                    .maybeSingle();

                if (
                    !selectedStudent
                ) {
                    return {
                        status:
                            "forbidden",
                    };
                }
            }

            /* ---------- Session State ---------- */

            const now =
                new Date();

            const startsAt =
                new Date(
                    session.starts_at,
                );

            if (
                now < startsAt
            ) {
                return {
                    status:
                        "not_started",
                };
            }



            /* ---------- Meeting Link ---------- */

            if (
                !session.meeting_id
            ) {
                return {
                    status:
                        "not_started",
                };
            }

            /* ---------- Join URL ---------- */

            const joinUrl = `https://app.zoom.us/wc/join/${session.meeting_id}?prefer=1${session.meeting_pwd
                ? `&pwd=${session.meeting_pwd}`
                : ""
                }`;
            const externalJoinUrl =
                `https://zoom.us/j/${session.meeting_id}${session.meeting_pwd
                    ? `?pwd=${session.meeting_pwd}`
                    : ""
                }`;
            return {
                status: "allowed",

                joinUrl,
                externalJoinUrl,

                session,
            };
        },
    );
