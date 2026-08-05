import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import {
    getAttemptExpiryWithGraceMs,
    isAttemptExpired,
} from "@/src/lib/helper-functions/attempt-expiry";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

/* ---------------------------------------------
 * Response Type
 * -------------------------------------------*/
export type SubmitTestResponse =
    | {
        kind: "submitted";
    }
    | {
        kind: "denied";
        reason:
        | "not_found"
        | "not_owner"
        | "submission_window_closed";
    };

/* ---------------------------------------------
 * Handler
 * -------------------------------------------*/
export async function POST(
    req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const user = auth.user;
    const { attemptId } = await params;
    const body = await req.json().catch(() => ({}));
    const pendingTimes = body?.pendingTimes ?? {};

    /* -------------------------------------------
     * 1. Load Attempt (ownership gate)
     * -----------------------------------------*/
    const { data: attempt, error: attemptError } = await supabase
        .from("test_attempts")
        .select(`id, user_id, started_at, time_limit_seconds, distribution_id, status`)
        .eq("id", attemptId)
        .single();

    if (attemptError || !attempt) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    if (attempt.user_id !== user.userId) {
        return NextResponse.json(
            { kind: "denied", reason: "not_owner" },
            { status: 403 }
        );
    }

    /* -------------------------------------------
     * IDEMPOTENCY EARLY RETURN
     * -----------------------------------------*/
    if (attempt.status === "submitted" || attempt.status === "expired") {
        return NextResponse.json({ kind: "submitted" });
    }

    /* -------------------------------------------
     * 2. Load Distribution
     * -----------------------------------------*/
    const { data: distribution } = await supabase
        .from("test_distributions")
        .select("ends_at")
        .eq("id", attempt.distribution_id)
        .single();

    if (!distribution) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    /* -------------------------------------------
     * 3. Grace-Aware Expiry Gate
     * -----------------------------------------*/
    const expiryMs = getAttemptExpiryWithGraceMs(
        {
            started_at: attempt.started_at,
            time_limit_seconds: attempt.time_limit_seconds,
        },
        {
            ends_at: distribution.ends_at,
        },
        TEST_GRACE_TIME_IN_SECONDS
    );

    const expired = isAttemptExpired(expiryMs);

    if (expired) {
        return NextResponse.json(
            { kind: "denied", reason: "submission_window_closed" },
            { status: 403 }
        );
    }

    /* -------------------------------------------
     * 4. Submit + Grade 
     * -----------------------------------------*/
    const { error } = await supabase.rpc(
        "rpc_submit_and_grade_attempt",
        {
            p_attempt_id: attemptId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
            p_pending_times: pendingTimes,
        }
    );

    if (error) {
        console.error("rpc_submit_and_grade_attempt error:", error);
        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 500 }
        );
    }

    /* -------------------------------------------
     * 5. Success
     * -----------------------------------------*/
    return NextResponse.json({
        kind: "submitted",
    } satisfies SubmitTestResponse);
}
