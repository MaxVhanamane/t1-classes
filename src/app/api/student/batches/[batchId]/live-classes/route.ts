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

type LiveClassStatus =
    | "live"
    | "upcoming"
    | "completed";

type BatchLiveClassRpcRow = {
    id: string;

    title: string;

    description: string | null;

    youtube_live_id: string;

    starts_at: string;

    ends_at: string;

    status: LiveClassStatus;

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

    const { searchParams } =
        new URL(req.url);

    const rawPage = Number(
        searchParams.get("page") ??
        "1",
    );

    const status =
        (searchParams.get(
            "status",
        ) as LiveClassStatus | null) ??
        "live";

    if (
        status !== "live" &&
        status !== "upcoming" &&
        status !== "completed"
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

    const page =
        Number.isFinite(rawPage) &&
            rawPage > 0
            ? rawPage
            : 1;

    const limit = 10;

    const {
        data,
        error,
    } = await supabase.rpc(
        "get_student_batch_live_classes",
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
            "[FETCH_BATCH_LIVE_CLASSES_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error.message ===
                        "Access denied"
                        ? "Access denied"
                        : "Failed to load live classes",
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
            | BatchLiveClassRpcRow[]
            | null) ?? [];

    const total =
        rows[0]?.total_count ?? 0;

    return NextResponse.json({
        items: rows.map((row) => ({
            id: row.id,

            title: row.title,

            description:
                row.description,

            youtubeLiveId:
                row.youtube_live_id,

            startsAt:
                row.starts_at,

            endsAt:
                row.ends_at,

            status:
                row.status,
        })),

        page,

        total,

        totalPages:
            Math.ceil(
                total / limit,
            ),

        pageSize: limit,
    });
}
