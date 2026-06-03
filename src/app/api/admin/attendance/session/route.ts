import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import { AttendanceSessionDetail } from "@/src/app/admin/attendance/_features/types/attendance";

type SessionRow = {
    id: string;

    batch_id: string;

    created_at: string;

    batches: {
        title: string;
    } | null;

    creator: {
        full_name: string;
    } | null;
};

type AttendanceRecordRow = {
    student_id: string;

    status: "present" | "absent";

    enrollments: {
        id: string;

        roll_number: number;
    } | null;

    users: {
        full_name: string;
    } | null;
};

export async function GET(
    request: NextRequest,
) {
    try {
        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const sessionId =
            request.nextUrl.searchParams.get(
                "sessionId",
            );

        if (!sessionId) {
            return NextResponse.json(
                {
                    message:
                        "Session ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        const supabase =
            await createServerSupabaseClient();

        const {
            data: session,
            error: sessionError,
        } = await supabase
            .from(
                "attendance_sessions",
            )
            .select(`
                id,
                batch_id,
                created_at,
                batches (
                    title
                ),
                creator:users!attendance_sessions_created_by_fkey (
                    full_name
                )
            `)
            .eq(
                "id",
                sessionId,
            )
            .single()
            .overrideTypes<
                SessionRow,
                { merge: false }
            >();

        if (
            sessionError ||
            !session
        ) {
            return NextResponse.json(
                {
                    message:
                        "Attendance session not found",
                },
                {
                    status: 404,
                },
            );
        }

        const {
            data: records,
            error: recordsError,
        } = await supabase
            .from(
                "attendance_records",
            )
            .select(`
                student_id,
                status,
                enrollments!attendance_records_enrollment_id_fkey (
                    id,
                    roll_number
                ),
                users!attendance_records_student_id_fkey (
                    full_name
                )
            `)
            .eq(
                "attendance_session_id",
                sessionId,
            )
            .overrideTypes<
                AttendanceRecordRow[],
                { merge: false }
            >();

        if (recordsError) {
            return NextResponse.json(
                {
                    message:
                        recordsError.message,
                },
                {
                    status: 500,
                },
            );
        }

        const result: AttendanceSessionDetail =
        {
            id: session.id,

            batch_id:
                session.batch_id,

            batch_title:
                session.batches?.title ??
                "",

            created_at:
                session.created_at,

            created_by:
                null,

            created_by_name:
                session.creator
                    ?.full_name ??
                null,

            students:
                records
                    ?.map(
                        (
                            record,
                        ) => ({
                            enrollment_id:
                                record
                                    .enrollments
                                    ?.id ??
                                "",

                            user_id:
                                record.student_id,

                            roll_number:
                                record
                                    .enrollments
                                    ?.roll_number ??
                                0,

                            full_name:
                                record
                                    .users
                                    ?.full_name ??
                                "",

                            status:
                                record.status,
                        }),
                    )
                    .sort(
                        (
                            a,
                            b,
                        ) =>
                            a.roll_number -
                            b.roll_number,
                    ) ?? [],
        };

        return NextResponse.json(
            result,
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load attendance session",
            },
            {
                status: 500,
            },
        );
    }
}
