import {
    connection,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/src/lib/supabase/supabase-server";

import {
    requireStudentApiRoute,
} from "@/src/lib/auth/claims/require-role-api-route";

type GroupSessionStatus =
    | "live"
    | "scheduled"
    | "ended";

type GroupSessionRpcRow = {
    id: string;

    title: string;

    description: string | null;

    audience_type:
    | "batch"
    | "selected_students";

    meeting_id: string | null;

    meeting_passcode: string | null;

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
    await connection();

    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const supabase =
        await createServerSupabaseClient();

    const batchId =
        (await params).batchId;

    const {
        searchParams,
    } = new URL(req.url);

    const page = Math.max(
        1,
        Number(
            searchParams.get(
                "page",
            ) ?? "1",
        ),
    );

    const status =
        (
            searchParams.get(
                "status",
            ) as GroupSessionStatus | null
        ) ?? "live";

    if (
        status !== "live" &&
        status !== "scheduled" &&
        status !== "ended"
    ) {
        return NextResponse.json(
            {
                error: "Invalid status",
            },
            {
                status: 400,
            },
        );
    }

    const limit = 10;

    const {
        data,
        error,
    } = await supabase.rpc(
        "get_student_group_sessions",
        {
            p_student_id:
                auth.user.userId,

            p_batch_id:
                batchId,

            p_status:
                status,

            p_page:
                page,

            p_limit:
                limit,
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

    const rows =
        (data as
            | GroupSessionRpcRow[]
            | null) ?? [];

    const total =
        rows[0]?.total_count ??
        0;

    return NextResponse.json({
        items: rows.map(
            (row) => ({
                id: row.id,

                title: row.title,

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

                meetingPasscode:
                    row.meeting_passcode,

                status:
                    row.status,

                canJoin:
                    row.can_join,
            }),
        ),

        status,

        page,

        total,

        totalPages:
            Math.ceil(
                total / limit,
            ),

        pageSize:
            limit,
    });
}
