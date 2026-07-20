import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import {
    AttendanceHistoryResponse,
    AttendanceSessionListItem,
} from "@/src/app/admin/attendance/_features/types/attendance";

type AttendanceHistoryRow = {
    session_id: string;

    batch_id: string;

    batch_title: string;

    created_at: string;

    created_by: string | null;

    created_by_name: string | null;

    total_students: number;

    present_count: number;

    absent_count: number;

    total_count: number;
};

export async function GET(request: NextRequest) {
    try {
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const searchParams =
            request.nextUrl.searchParams;

        const batchId =
            searchParams.get(
                "batchId",
            ) ?? null;

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
            "get_attendance_history",
            {
                p_batch_id:
                    batchId,

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

        const rows: AttendanceHistoryRow[] =
            Array.isArray(data)
                ? (data as AttendanceHistoryRow[])
                : [];

        const totalCount =
            rows[0]
                ?.total_count ?? 0;

        const items: AttendanceSessionListItem[] =
            rows.map(
                (
                    row,
                ) => ({
                    id: row.session_id,

                    batch_id:
                        row.batch_id,

                    batch_title:
                        row.batch_title,

                    created_by:
                        row.created_by,

                    created_by_name:
                        row.created_by_name,

                    created_at:
                        row.created_at,

                    total_students:
                        Number(
                            row.total_students,
                        ),

                    present_count:
                        Number(
                            row.present_count,
                        ),

                    absent_count:
                        Number(
                            row.absent_count,
                        ),
                }),
            );

        const response: AttendanceHistoryResponse =
        {
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
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load attendance history",
            },
            {
                status: 500,
            },
        );
    }
}
