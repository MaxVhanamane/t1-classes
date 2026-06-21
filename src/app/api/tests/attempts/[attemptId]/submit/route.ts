import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import {
    getAttemptExpiryWithGraceMs,
    isAttemptExpired,
} from "@/src/lib/helper-functions/attempt-expiry";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

/* ---------------------------------------------
 * Response Type
 * -------------------------------------------*/
export type SubmitTestResponse =
    | {
        kind: "submitted";
        attemptId: string;
        obtainedMarks: number;
        totalMarks: number;
        percentage: number;
        correctCount: number;
        partialCorrectCount: number;
        wrongCount: number;
        unansweredCount: number;
        status: "submitted" | "expired";
        submittedAt: string;
        activeTimeSeconds: number;
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
    const user = auth.user
    const { attemptId } = await params;
    const body = await req.json().catch(() => ({}));

    const pendingTimes =
        body?.pendingTimes ?? {};

    /* -------------------------------------------
     * 1. Load Attempt (ownership gate)
     * -----------------------------------------*/
    const { data: attempt, error: attemptError } =
        await supabase
            .from("test_attempts")
            .select(
                `
        id,
        user_id,
        started_at,
        time_limit_seconds,
        distribution_id,
        status,
        submitted_at
      `
            )
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
    if (
        attempt.status === "submitted" ||
        attempt.status === "expired"
    ) {
        const { data: existingResult } = await supabase
            .from("test_results")
            .select(
                `
        obtained_marks,
        total_marks,
        correct_count,
        wrong_count,
        unanswered_count,
        partial_correct_count,
        active_time_seconds
      `
            )
            .eq("attempt_id", attemptId)
            .single();

        if (existingResult) {
            const obtainedMarks = Number(
                existingResult.obtained_marks
            );
            const totalMarks = Number(
                existingResult.total_marks
            );

            const percentage =
                totalMarks > 0
                    ? Number(
                        (
                            (obtainedMarks / totalMarks) *
                            100
                        ).toFixed(2)
                    )
                    : 0;

            return NextResponse.json({
                kind: "submitted",
                attemptId,
                obtainedMarks,
                totalMarks,
                percentage,
                correctCount:
                    existingResult.correct_count,
                wrongCount: existingResult.wrong_count,
                unansweredCount:
                    existingResult.unanswered_count,
                partialCorrectCount:
                    existingResult.partial_correct_count,
                status: attempt.status,
                submittedAt: attempt.submitted_at,
                activeTimeSeconds:
                    existingResult.active_time_seconds ?? 0,
            } satisfies SubmitTestResponse);
        }
    }

    /* -------------------------------------------
     * 2. Load Distribution
     * -------------------------------------------
     * Needed to clamp expiry with distribution window
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
     * -------------------------------------------
     * WHY this exists:
     *
     * - Prevent late manual submissions
     * - Frontend timers are not reliable
     * - Autosubmit may fail (tab close, crash)
     *
     * We mirror the SAME logic used in RPC:
     *
     *   expiry =
     *     MIN(
     *       attempt + duration + grace,
     *       distribution_end + grace
     *     )
     *
     * Using shared utils guarantees:
     *   API + RPC + Autosubmit stay in sync
     * -----------------------------------------*/
    const expiryMs =
        getAttemptExpiryWithGraceMs(
            {
                started_at: attempt.started_at,
                time_limit_seconds:
                    attempt.time_limit_seconds,
            },
            {
                ends_at: distribution.ends_at,
            },
            TEST_GRACE_TIME_IN_SECONDS
        );

    const expired = isAttemptExpired(expiryMs);

    if (expired) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "submission_window_closed",
            },
            { status: 403 }
        );
    }

    /* -------------------------------------------
     * 4. Submit + Grade (RPC = source of truth)
     * -----------------------------------------*/
    const { data, error } = await supabase.rpc(
        "rpc_submit_and_grade_attempt",
        {
            p_attempt_id: attemptId,
            p_grace_seconds:
                TEST_GRACE_TIME_IN_SECONDS,
            p_pending_times:
                pendingTimes,
        }
    );

    if (
        error ||
        !Array.isArray(data) ||
        !data[0]
    ) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 500 }
        );
    }

    const result = data[0];

    const obtainedMarks = Number(
        result.obtained_marks
    );
    const totalMarks = Number(
        result.total_marks
    );

    const percentage =
        totalMarks > 0
            ? Number(
                (
                    (obtainedMarks / totalMarks) *
                    100
                ).toFixed(2)
            )
            : 0;

    /* -------------------------------------------
     * 5. Success
     * -----------------------------------------*/
    return NextResponse.json({
        kind: "submitted",
        attemptId: result.attempt_id,
        obtainedMarks,
        totalMarks,
        percentage,
        correctCount: result.correct_count,
        wrongCount: result.wrong_count,
        unansweredCount:
            result.unanswered_count,
        partialCorrectCount:
            result.partial_correct_count,
        status: result.status,
        submittedAt: result.submitted_at,
        activeTimeSeconds:
            result.active_time_seconds ?? 0,
    } satisfies SubmitTestResponse);
}
