import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";

/* ------------------------------------------------------- */
/* Types                                                   */
/* ------------------------------------------------------- */

export type LeaderboardRow = {
    rank: number;
    userId: string;
    obtainedMarks: number;
    totalMarks: number;
    performanceLabel: string | null;
    percentile: number;
};

export type LeaderboardResponse =
    | {
        kind: "pending";
        message: string;
        endsAt: string;
    }
    | {
        kind: "ok";
        rows: LeaderboardRow[];
        nextCursor: string | null;
    };

/* ------------------------------------------------------- */
/* Cursor Helpers                                          */
/* ------------------------------------------------------- */

type CursorPayload = {
    rank: number;
    id: string;
};

function encodeCursor(payload: CursorPayload) {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeCursor(cursor?: string | null): CursorPayload | null {
    if (!cursor) return null;

    try {
        return JSON.parse(
            Buffer.from(cursor, "base64").toString("utf-8")
        );
    } catch {
        return null;
    }
}

/* ------------------------------------------------------- */
/* Handler                                                 */
/* ------------------------------------------------------- */

export async function GET(
    req: Request,
    { params }: { params: Promise<{ distributionId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const { distributionId } = await params;

    const { searchParams } = new URL(req.url);

    const limit = Math.min(
        Number(searchParams.get("limit") ?? 20),
        100
    );

    const cursor = decodeCursor(
        searchParams.get("cursor")
    );

    const now = new Date();

    /* -------------------------------------------- */
    /* 1. Load Distribution                         */
    /* -------------------------------------------- */

    const { data: dist } = await supabase
        .from("test_distributions")
        .select("id, ends_at, ranks_computed")
        .eq("id", distributionId)
        .single();

    if (!dist) {
        return NextResponse.json(
            {
                kind: "pending",
                message: "Distribution not found",
                endsAt: "",
            },
            { status: 404 }
        );
    }

    const endsAt = new Date(dist.ends_at);

    /* -------------------------------------------- */
    /* 2. Distribution + Grace Guard                */
    /* -------------------------------------------- */
    /**
     * Leaderboard must not be visible until:
     * • Distribution ended
     * • Grace window ended
     */

    const graceEndsAt = new Date(
        endsAt.getTime() +
        TEST_GRACE_TIME_IN_SECONDS * 1000
    );

    if (now < graceEndsAt) {
        return NextResponse.json({
            kind: "pending",
            message:
                "Leaderboard will be available once the test is fully completed for all participants.",
            endsAt: dist.ends_at,
        } satisfies LeaderboardResponse);
    }

    /* -------------------------------------------- */
    /* 3. Auto-grade expired attempts               */
    /* -------------------------------------------- */
    /**
     * Ensures:
     * • All in-progress attempts finalized
     * • No participant excluded
     * • Ranking fairness preserved
     */

    await supabase.rpc(
        "rpc_auto_grade_expired_attempts",
        {
            p_distribution_id: distributionId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
        }
    );

    /* -------------------------------------------- */
    /* 4. Finalize Ranking (runs once)              */
    /* -------------------------------------------- */

    if (!dist.ranks_computed) {
        await supabase.rpc("rpc_finalize_ranking", {
            p_distribution_id: distributionId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
        });
    }

    /* -------------------------------------------- */
    /* 5. Build Query                               */
    /* -------------------------------------------- */

    let query = supabase
        .from("test_results")
        .select(
            `
        id,
        rank,
        user_id,
        obtained_marks,
        total_marks,
        performance_label,
        total_participants
      `
        )
        .eq("distribution_id", distributionId)
        .order("rank", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit + 1); // +1 → detect next page

    /* -------------------------------------------- */
    /* Cursor condition                             */
    /* -------------------------------------------- */

    if (cursor) {
        query = query.or(
            `rank.gt.${cursor.rank},and(rank.eq.${cursor.rank},id.gt.${cursor.id})`
        );
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            {
                kind: "pending",
                message: "Failed to load leaderboard",
                endsAt: dist.ends_at,
            },
            { status: 500 }
        );
    }

    const rows = data ?? [];

    /* -------------------------------------------- */
    /* 6. Pagination                                */
    /* -------------------------------------------- */

    let nextCursor: string | null = null;

    if (rows.length > limit) {
        const next = rows.pop();

        if (next) {
            nextCursor = encodeCursor({
                rank: next.rank,
                id: next.id,
            });
        }
    }

    /* -------------------------------------------- */
    /* 7. Map Response                              */
    /* -------------------------------------------- */

    const mapped: LeaderboardRow[] = rows.map(
        (r) => {
            const total =
                r.total_participants ?? 0;

            const percentile =
                total > 0
                    ? Number(
                        (
                            ((total - r.rank) /
                                total) *
                            100
                        ).toFixed(2)
                    )
                    : 0;

            return {
                rank: r.rank,
                userId: r.user_id,
                obtainedMarks: r.obtained_marks,
                totalMarks: r.total_marks,
                performanceLabel:
                    r.performance_label,
                percentile,
            };
        }
    );

    /* -------------------------------------------- */
    /* 8. Response                                  */
    /* -------------------------------------------- */

    return NextResponse.json({
        kind: "ok",
        rows: mapped,
        nextCursor,
    } satisfies LeaderboardResponse);
}
