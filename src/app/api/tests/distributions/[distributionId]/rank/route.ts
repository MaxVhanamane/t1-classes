import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

export type MyRankResponse =
    | { kind: "pending"; message: string; endsAt: string }
    | { kind: "not_attempted"; message: string }
    | {
        kind: "ok";
        distributionId: string;
        rank: number | null;
        totalParticipants: number;
        performanceLabel: string | null;
    };

type DistributionRow = {
    id: string;
    ends_at: string;
    ranks_computed: boolean;
};

type ResultRow = {
    rank: number | null;
    total_participants: number | null;
    obtained_marks: number;
    total_marks: number;
    performance_label: string | null;
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ distributionId: string }> }
) {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user
    const supabase = await createServerSupabaseClient();
    const { distributionId } = await params;

    const nowMs = Date.now();

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
            { kind: "not_attempted", message: "Distribution not found" },
            { status: 404 }
        );
    }

    const distribution = dist as DistributionRow;

    /* -------------------------------------------- */
    /* 2. Block Until Distribution + Grace Ends     */
    /* -------------------------------------------- */
    const distributionExpiryMs =
        new Date(distribution.ends_at).getTime() +
        TEST_GRACE_TIME_IN_SECONDS * 1000;

    if (nowMs < distributionExpiryMs) {
        return NextResponse.json({
            kind: "pending",
            message:
                "Ranking will be available once the test time is fully completed for all students.",
            endsAt: distribution.ends_at,
        } satisfies MyRankResponse);
    }

    /* -------------------------------------------- */
    /* 3. Ensure Ranking Computed                   */
    /* -------------------------------------------- */
    if (!distribution.ranks_computed) {
        /**
         * Step 1 → Auto-grade expired attempts
         * Only runs grading if in_progress exist
         */
        await supabase.rpc("rpc_auto_grade_expired_attempts", {
            p_distribution_id: distributionId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
        });

        /**
         * Step 2 → Finalize ranking
         * Distribution row lock prevents duplicates
         */
        const { error } = await supabase.rpc("rpc_finalize_ranking", {
            p_distribution_id: distributionId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
        });

        if (error) {
            return NextResponse.json({
                kind: "pending",
                message: "Ranking is being finalized. Please refresh shortly.",
                endsAt: distribution.ends_at,
            } satisfies MyRankResponse);
        }
    }

    /* -------------------------------------------- */
    /* 4. Check Attempt                             */
    /* -------------------------------------------- */
    const { data: attempt } = await supabase
        .from("test_attempts")
        .select("id")
        .eq("distribution_id", distributionId)
        .eq("user_id", user.userId)
        .single();

    if (!attempt) {
        return NextResponse.json({
            kind: "not_attempted",
            message: "You did not attempt this test",
        } satisfies MyRankResponse);
    }

    /* -------------------------------------------- */
    /* 5. Fetch Result                              */
    /* -------------------------------------------- */
    const { data: result } = await supabase
        .from("test_results")
        .select(
            "rank, total_participants, performance_label"
        )
        .eq("distribution_id", distributionId)
        .eq("user_id", user.userId)
        .single();

    if (!result || result.rank === null) {
        return NextResponse.json({
            kind: "pending",
            message: "Your ranking is being finalized. Please refresh shortly.",
            endsAt: distribution.ends_at,
        } satisfies MyRankResponse);
    }

    const row = result as ResultRow;

    /* -------------------------------------------- */
    /* 6. Success                                   */
    /* -------------------------------------------- */
    return NextResponse.json({
        kind: "ok",
        distributionId,
        rank: row.rank,
        totalParticipants: row.total_participants ?? 0,
        performanceLabel: row.performance_label,
    } satisfies MyRankResponse);
}
