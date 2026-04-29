import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";

type LiveClassRow = {
    id: string;
    title: string;
    description: string | null;
    youtube_live_id: string;
    starts_at: string;
    ends_at: string;
};

type LiveClassJoinRow = {
    live_class_id: string;
    live_classes: LiveClassRow | null;
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
    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const user = auth.user;

    const supabase =
        await createServerSupabaseClient();

    const { batchId } =
        await params;

    /* ---------------------------------- */
    /* Enrollment Gate                    */
    /* ---------------------------------- */
    const enrollment =
        await getEnrollmentAccess(
            supabase,
            user.userId,
            {
                type: "batch",
                batchId,
            },
        );

    if (
        !enrollment.hasAccess
    ) {
        return NextResponse.json(
            {
                error:
                    "Access denied",
            },
            {
                status: 403,
            },
        );
    }

    /* ---------------------------------- */
    /* Pagination                         */
    /* ---------------------------------- */
    const url =
        new URL(req.url);

    const page = Math.max(
        1,
        Number(
            url.searchParams.get(
                "page",
            ),
        ) || 1,
    );

    const limit = Math.min(
        20,
        Math.max(
            1,
            Number(
                url.searchParams.get(
                    "limit",
                ),
            ) || 6,
        ),
    );

    const from =
        (page - 1) * limit;

    const to =
        from + limit - 1;

    /* ---------------------------------- */
    /* Fetch                              */
    /* ---------------------------------- */
    const {
        data,
        count,
        error,
    } = await supabase
        .from(
            "live_class_batches",
        )
        .select(
            `
      live_class_id,
      live_classes (
        id,
        title,
        description,
        youtube_live_id,
        starts_at,
        ends_at
      )
    `,
            {
                count: "exact",
            },
        )
        .eq("batch_id", batchId)
        .order(
            "starts_at",
            {
                referencedTable:
                    "live_classes",
                ascending: false,
            },
        )
        .range(from, to)
        .overrideTypes<
            LiveClassJoinRow[]
        >();

    if (
        error ||
        !data
    ) {
        return NextResponse.json(
            {
                error:
                    "Failed to load live classes",
            },
            {
                status: 500,
            },
        );
    }

    /* ---------------------------------- */
    /* Normalize                          */
    /* ---------------------------------- */
    const rows: LiveClassRow[] =
        data
            .map(
                (item) =>
                    item.live_classes,
            )
            .filter(
                (
                    item,
                ): item is LiveClassRow =>
                    item !== null,
            );

    return NextResponse.json({
        rows,
        total:
            count ?? 0,
        page,
        limit,
    });
}
