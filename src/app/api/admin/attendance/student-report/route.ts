import { connection, NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import {
    AttendanceStudentReportResponse,
    AttendanceStudentReportSummary,
    AttendanceStudentSession,
} from "@/src/app/admin/attendance/_features/types/attendance";

type StudentAttendanceReportRpcRow = {
    summary: AttendanceStudentReportSummary | null;

    sessions: AttendanceStudentSession[];

    total_count: number;
};

export async function GET(
    request: NextRequest,
) {
    await connection()
    try {
        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const searchParams =
            request.nextUrl.searchParams;

        const batchId =
            searchParams.get(
                "batchId",
            );

        const userId =
            searchParams.get(
                "userId",
            );

        if (!batchId) {
            return NextResponse.json(
                {
                    message:
                        "Batch ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        if (!userId) {
            return NextResponse.json(
                {
                    message:
                        "User ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        const startDate =
            searchParams.get(
                "startDate",
            ) ?? null;

        const endDate =
            searchParams.get(
                "endDate",
            ) ?? null;

        const page = Math.max(
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
            1,
        );

        const pageSize = Math.min(
            Math.max(
                Number(
                    searchParams.get(
                        "pageSize",
                    ) ?? "20",
                ),
                1,
            ),
            100,
        );

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase.rpc(
            "get_student_attendance_report",
            {
                p_batch_id:
                    batchId,

                p_user_id:
                    userId,

                p_teacher_id:
                    auth.user.role ===
                        "teacher"
                        ? auth.user
                            .userId
                        : null,

                p_start_date:
                    startDate,

                p_end_date:
                    endDate,

                p_page:
                    page,

                p_page_size:
                    pageSize,
            },
        );

        if (error) {
            console.error(
                "STUDENT REPORT RPC ERROR",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 500,
                },
            );
        }

        const row:
            | StudentAttendanceReportRpcRow
            | null =
            Array.isArray(data)
                ? (data[0] as StudentAttendanceReportRpcRow)
                : null;

        if (
            !row ||
            !row.summary
        ) {
            return NextResponse.json(
                {
                    message:
                        "Student attendance report not found",
                },
                {
                    status: 404,
                },
            );
        }

        const totalCount =
            Number(
                row.total_count,
            ) || 0;

        const response: AttendanceStudentReportResponse =
        {
            summary:
                row.summary,

            sessions:
                row.sessions ??
                [],

            totalCount,

            page,

            pageSize,

            totalPages:
                Math.ceil(
                    totalCount /
                    pageSize,
                ),
        };

        return NextResponse.json(
            response,
        );
    } catch (error) {
        console.error(
            "STUDENT REPORT ERROR",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load student attendance report",
            },
            {
                status: 500,
            },
        );
    }
}
