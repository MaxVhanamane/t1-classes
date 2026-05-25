"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import {
    createGroupSessionSchema,
    CreateGroupSessionSchema,
} from "../zod/create-group-session.schema";

type CreateGroupSessionInput =
    CreateGroupSessionSchema & {
        meeting_id: string | null;
        meeting_pwd: string | null;
    };

export async function createGroupSession(
    input: unknown,
): Promise<ServerActionResponse<string>> {
    /* ---------- Auth ---------- */

    const staff = await requireStaffServerOnly();

    try {
        /* ---------- Validate ---------- */

        const parsed =
            createGroupSessionSchema.safeParse(input);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Invalid session data",
            };
        }

        const values =
            input as CreateGroupSessionInput;

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Create Session ---------- */

        const {
            data: session,
            error: groupSessionError,
        } = await supabase
            .from("group_sessions")
            .insert({
                title: values.title,

                description:
                    values.description || null,

                batch_id: values.batch_id,

                audience_type:
                    values.audience_type,

                starts_at:
                    values.starts_at.toISOString(),

                expected_duration_minutes:
                    values.expected_duration_minutes,

                meeting_id:
                    values.meeting_id,

                meeting_pwd:
                    values.meeting_pwd,

                created_by:
                    staff.userId,
            })
            .select("id")
            .single();

        if (
            groupSessionError ||
            !session
        ) {
            console.error(
                "[CREATE_GROUP_SESSION_ERROR]",
                groupSessionError,
            );

            return {
                error:
                    "Failed to create group session",
            };
        }

        /* ---------- Selected Students ---------- */

        if (
            values.audience_type ===
            "selected_students" &&
            values.student_ids.length > 0
        ) {
            const {
                error: studentsError,
            } = await supabase
                .from("group_session_students")
                .insert(
                    values.student_ids.map(
                        (studentId) => ({
                            session_id: session.id,
                            student_id: studentId,
                        }),
                    ),
                );

            if (studentsError) {
                console.error(
                    "[CREATE_GROUP_SESSION_STUDENTS_ERROR]",
                    studentsError,
                );

                return {
                    error:
                        "Session created, but assigning students failed",
                };
            }
        }

        /* ---------- Success ---------- */

        return {
            data: session.id,
        };
    } catch (error) {
        console.error(
            "[CREATE_GROUP_SESSION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
