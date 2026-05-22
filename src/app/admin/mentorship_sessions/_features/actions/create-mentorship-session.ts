"use server";

import { addMinutes } from "date-fns";


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

import {
    createMentorshipSessionSchema,
} from "../zod/create-mentorship-session.schema";


export async function createMentorshipSession(
    input: unknown,
): Promise<
    ServerActionResponse<string>
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

        /* ---------- Platform Setting ---------- */

        const {
            data: setting,
            error:
            platformSettingError,
        } = await supabase
            .from(
                "platform_settings",
            )
            .select("value")
            .eq(
                "key",
                "mentorship_sessions_enabled",
            )
            .limit(1)
            .maybeSingle();



        if (
            platformSettingError
        ) {
            console.error(
                "[MENTORSHIP_PLATFORM_SETTING_ERROR]",
                platformSettingError,
            );

            return {
                error:
                    "Failed to verify mentorship settings",
            };
        }

        const isEnabled =
            setting?.value === true;

        if (!isEnabled) {
            return {
                error:
                    "Mentorship session creation is currently disabled",
            };
        }
        /* ---------- Calculate Ends At ---------- */

        const endsAt =
            addMinutes(
                values.starts_at,
                values.duration_minutes,
            );

        /* ---------- Create Session ---------- */

        const {
            data: session,
            error:
            mentorshipError,
        } = await supabase
            .from(
                "mentorship_sessions",
            )
            .insert({
                title:
                    values.title,

                description:
                    values.description ||
                    null,

                batch_id:
                    values.batch_id,

                audience_type:
                    values.audience_type,

                starts_at:
                    values.starts_at.toISOString(),

                ends_at:
                    endsAt.toISOString(),

                duration_minutes:
                    values.duration_minutes,

                created_by:
                    staff.userId,
            })
            .select("id")
            .single();

        if (
            mentorshipError ||
            !session
        ) {
            console.error(
                "[CREATE_MENTORSHIP_SESSION_ERROR]",
                mentorshipError,
            );

            return {
                error:
                    "Failed to create mentorship session",
            };
        }

        /* ---------- Selected Students ---------- */

        if (
            values.audience_type ===
            "selected_students" &&
            values.student_ids
                .length > 0
        ) {
            const {
                error:
                studentsError,
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
                                session.id,

                            student_id:
                                studentId,
                        }),
                    ),
                );

            if (
                studentsError
            ) {
                console.error(
                    "[CREATE_MENTORSHIP_SESSION_STUDENTS_ERROR]",
                    studentsError,
                );

                return {
                    error:
                        "Session created, but assigning students failed",
                };
            }
        }

        /* ---------- Revalidate ---------- */

        return {
            data: session.id,
        };
    } catch (error) {
        console.error(
            "[CREATE_MENTORSHIP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
