import { connection, NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import {
    AttendanceBatchReportResponse,
    AttendanceBatchReportRow,
    AttendanceBatchReportSummary,
} from "@/src/app/admin/attendance/_features/types/attendance";

type BatchAttendanceReportRpcRow = {
    enrollment_id: string;
    user_id: string;
    roll_number: number;
    full_name: string;
    is_active: boolean;
    present_count: number;
    absent_count: number;
    classes_during_enrollment: number;
    attendance_percentage: number;

    batch_title: string;
    total_students: number;
    active_students: number;
    average_attendance: number;
    below_75_count: number;

    total_count: number;
};

export async function GET(request: NextRequest) {
    await connection()
    try {
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const searchParams = request.nextUrl.searchParams;

        const batchId = searchParams.get("batchId");

        if (!batchId) {
            return NextResponse.json(
                {
                    message: "Batch ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        const search =
            searchParams.get("search") ?? null;

        const startDate =
            searchParams.get("startDate") ??
            null;

        const endDate =
            searchParams.get("endDate") ??
            null;

        const page = Math.max(
            Number(
                searchParams.get("page") ??
                "1",
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

        const { data, error } =
            await supabase.rpc(
                "get_batch_attendance_report",
                {
                    p_batch_id: batchId,

                    p_teacher_id:
                        auth.user.role ===
                            "teacher"
                            ? auth.user.userId
                            : null,

                    p_search: search,

                    p_start_date:
                        startDate,

                    p_end_date:
                        endDate,

                    p_page: page,

                    p_page_size:
                        pageSize,
                },
            );


        if (error) {
            return NextResponse.json(
                {
                    message: error.message,
                },
                {
                    status: 500,
                },
            );
        }

        const rows: BatchAttendanceReportRpcRow[] =
            Array.isArray(data)
                ? (data as BatchAttendanceReportRpcRow[])
                : [];

        const totalCount =
            rows[0]?.total_count ?? 0;

        const summary: AttendanceBatchReportSummary =
        {
            batch_id: batchId,

            batch_title:
                rows[0]?.batch_title ??
                "",

            total_students:
                Number(
                    rows[0]
                        ?.total_students ?? 0,
                ),

            active_students:
                Number(
                    rows[0]
                        ?.active_students ?? 0,
                ),

            average_attendance:
                Number(
                    rows[0]
                        ?.average_attendance ??
                    0,
                ),

            below_75_count:
                Number(
                    rows[0]
                        ?.below_75_count ??
                    0,
                ),
        };

        const items: AttendanceBatchReportRow[] =
            rows.map((row) => ({
                enrollment_id:
                    row.enrollment_id,

                user_id: row.user_id,

                roll_number: Number(
                    row.roll_number,
                ),

                full_name:
                    row.full_name,

                is_active:
                    row.is_active,

                present_count:
                    Number(
                        row.present_count,
                    ),

                absent_count:
                    Number(
                        row.absent_count,
                    ),

                classes_during_enrollment:
                    Number(
                        row.classes_during_enrollment,
                    ),

                attendance_percentage:
                    Number(
                        row.attendance_percentage,
                    ),
            }));

        const response: AttendanceBatchReportResponse =
        {
            summary,

            items,

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
            "BATCH REPORT ROUTE ERROR",
            error,
        );
        return NextResponse.json(
            {
                message:
                    "Failed to load batch attendance report",
            },
            {
                status: 500,
            },
        );
    }
}
