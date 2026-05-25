import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

type GroupSessionRpcRow = {
    id: string;

    title: string;

    description: string | null;

    audience_type:
    | "batch"
    | "selected_students";

    meeting_id: string | null;

    starts_at: string;

    expected_duration_minutes: number | null;

    teacher_name: string;

    status:
    | "scheduled"
    | "live"
    | "ended"
    | "waiting_for_link";

    can_join: boolean;

    total_count: number;
};

export async function GET(
    req: Request,

    {
        params,
    }: {
        params: Promise<{
            batchId: string;
        }>;
    },
) {
    /* ---------- Auth ---------- */

    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const user =
        auth.user;

    const supabase =
        await createServerSupabaseClient();

    const batchId =
        (await params).batchId;

    /* ---------- Pagination ---------- */

    const {
        searchParams,
    } = new URL(req.url);

    const page =
        Math.max(
            1,
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
        );

    const limit = 10;

    /* ---------- Fetch Sessions ---------- */

    const {
        data,
        error,
    } = await supabase.rpc(
        "get_student_group_sessions",
        {
            p_student_id:
                user.userId,

            p_batch_id:
                batchId,

            p_page: page,

            p_limit: limit,
        },
    );

    if (error) {
        console.error(
            "[FETCH_GROUP_SESSIONS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error.message ===
                        "Access denied"
                        ? "Access denied"
                        : "Failed to load group sessions",
            },
            {
                status:
                    error.message ===
                        "Access denied"
                        ? 403
                        : 500,
            },
        );
    }

    /* ---------- Normalize ---------- */

    const rows =
        (data as
            | GroupSessionRpcRow[]
            | null) ?? [];

    const result =
        rows.map(
            (row) => ({
                id: row.id,

                title:
                    row.title,

                description:
                    row.description,

                startsAt:
                    row.starts_at,

                expectedDurationMinutes:
                    row.expected_duration_minutes,

                audienceType:
                    row.audience_type,

                teacherName:
                    row.teacher_name,

                meetingId:
                    row.meeting_id,

                status:
                    row.status,

                canJoin:
                    row.can_join,
            }),
        );

    const total =
        rows[0]
            ?.total_count ?? 0;

    return NextResponse.json({
        items: result,

        page,

        total,

        totalPages:
            Math.ceil(
                total / limit,
            ),

        pageSize: limit,
    });
}
