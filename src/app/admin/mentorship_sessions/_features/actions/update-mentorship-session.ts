"use server";

import { addMinutes } from "date-fns";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

import {
    createMentorshipSessionSchema,
} from "../zod/create-mentorship-session.schema";

export async function updateMentorshipSession(
    sessionId: string,

    input: unknown,
): Promise<
    ServerActionResponse<void>
> {
    /* ---------- Auth ---------- */

    const staff =
        await requireStaffServerOnly();

    try {
        /* ---------- Validate ---------- */

        const parsed =
            createMentorshipSessionSchema.safeParse(
                input,
            );

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]
                        ?.message ??
                    "Invalid session data",
            };
        }

        const values =
            parsed.data;

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
        batch_id,
        starts_at,
        ends_at,
        audience_type,
        duration_minutes,
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
            data: existingSession,
            error:
            existingSessionError,
        } = await query.single();

        if (
            existingSessionError ||
            !existingSession
        ) {
            return {
                error:
                    "Mentorship session not found",
            };
        }

        /* ---------- Edit Rules ---------- */

        const hasStarted =
            new Date() >=
            new Date(
                existingSession.starts_at,
            );

        const hasMeeting =
            !!existingSession.meeting_id;

        const canEditSchedule =
            !hasStarted &&
            !hasMeeting;

        /* ---------- Batch Immutable ---------- */

        if (
            values.batch_id !==
            existingSession.batch_id
        ) {
            return {
                error:
                    "Batch cannot be changed after creation",
            };
        }

        /* ---------- Scheduling Changes ---------- */

        const schedulingChanged =
            values.audience_type !==
            existingSession.audience_type ||
            values.duration_minutes !==
            existingSession.duration_minutes ||
            new Date(
                values.starts_at,
            ).toISOString() !==
            new Date(
                existingSession.starts_at,
            ).toISOString();

        if (
            !canEditSchedule &&
            schedulingChanged
        ) {
            return {
                error:
                    "Schedule settings can no longer be updated",
            };
        }

        /* ---------- Calculate Ends At ---------- */

        const endsAt =
            addMinutes(
                values.starts_at,
                values.duration_minutes,
            );

        /* ---------- Update Session ---------- */

        const {
            error:
            updateSessionError,
        } = await supabase
            .from(
                "mentorship_sessions",
            )
            .update({
                title:
                    values.title,

                description:
                    values.description ||
                    null,

                starts_at:
                    values.starts_at.toISOString(),

                ends_at:
                    endsAt.toISOString(),

                duration_minutes:
                    values.duration_minutes,

                audience_type:
                    values.audience_type,
            })
            .eq("id", sessionId);

        if (
            updateSessionError
        ) {
            console.error(
                "[UPDATE_MENTORSHIP_SESSION_ERROR]",
                updateSessionError,
            );

            return {
                error:
                    "Failed to update mentorship session",
            };
        }

        /* ---------- Students ---------- */

        if (
            canEditSchedule
        ) {
            /* ---------- Delete Old ---------- */

            const {
                error:
                deleteStudentsError,
            } = await supabase
                .from(
                    "mentorship_session_students",
                )
                .delete()
                .eq(
                    "session_id",
                    sessionId,
                );

            if (
                deleteStudentsError
            ) {
                console.error(
                    "[DELETE_MENTORSHIP_STUDENTS_ERROR]",
                    deleteStudentsError,
                );

                return {
                    error:
                        "Failed to update students",
                };
            }

            /* ---------- Insert New ---------- */

            if (
                values.audience_type ===
                "selected_students" &&
                values.student_ids
                    .length > 0
            ) {
                const {
                    error:
                    insertStudentsError,
                } = await supabase
                    .from(
                        "mentorship_session_students",
                    )
                    .insert(
                        values.student_ids.map(
                            (
                                studentId,
                            ) => ({
                                session_id:
                                    sessionId,

                                student_id:
                                    studentId,
                            }),
                        ),
                    );

                if (
                    insertStudentsError
                ) {
                    console.error(
                        "[INSERT_MENTORSHIP_STUDENTS_ERROR]",
                        insertStudentsError,
                    );

                    return {
                        error:
                            "Failed to update students",
                    };
                }
            }
        }



        return {
            data: undefined,
        };
    } catch (error) {
        console.error(
            "[UPDATE_MENTORSHIP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
