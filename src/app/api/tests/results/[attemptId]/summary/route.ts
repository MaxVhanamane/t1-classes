import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";

/* --------------------------------------------- */
/* Response Types */
/* --------------------------------------------- */

export type PerformanceLabelType =
    | "Perfect"
    | "Excellent"
    | "Good"
    | "Average"
    | "Needs Improvement"
    | null;

export type ResultSummaryResponse =
    | {
        kind: "ok";

        attemptId: string;
        testId: string;
        distributionId: string;

        distributionEndsAt: string;
        rankingAvailableAt: string;

        obtainedMarks: number;
        totalMarks: number;
        percentage: number;

        rank: number | null;
        percentile: number | null;

        performanceLabel: PerformanceLabelType;
        totalParticipants: number | null;

        activeTimeSeconds: number;

        correctCount: number;
        partialCorrectCount: number;
        wrongCount: number;
        unansweredCount: number;

        status:
        | "submitted"
        | "expired"
        | "in_progress";

        submittedAt: string;

        test: {
            title: string;
        };
    }
    | {
        kind: "denied";
        reason:
        | "attempt_not_found"
        | "not_found";
    }
    | {
        kind: "pending";
        message: string;
    };

/* --------------------------------------------- */
/* Route */
/* --------------------------------------------- */

export async function GET(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{
            attemptId: string;
        }>;
    }
) {
    const auth =
        await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const { attemptId } =
        await params;

    const supabase =
        await createServerSupabaseClient();

    const { data, error } =
        await supabase.rpc(
            "get_my_attempt_result_summary",
            {
                p_attempt_id:
                    attemptId,

                p_user_id:
                    auth.user.userId,

                p_grace_seconds:
                    TEST_GRACE_TIME_IN_SECONDS,
            }
        );

    if (error) {
        console.error(
            "get_my_attempt_result_summary error:",
            error
        );

        return NextResponse.json<ResultSummaryResponse>(
            {
                kind: "denied",
                reason:
                    "not_found",
            },
            {
                status: 500,
            }
        );
    }

    const result =
        data as
        | ResultSummaryResponse
        | null;

    if (!result) {
        return NextResponse.json<ResultSummaryResponse>(
            {
                kind: "denied",
                reason:
                    "not_found",
            },
            {
                status: 404,
            }
        );
    }

    if (
        result.kind ===
        "denied"
    ) {
        return NextResponse.json(
            result,
            {
                status:
                    result.reason ===
                        "attempt_not_found"
                        ? 404
                        : 403,
            }
        );
    }

    if (
        result.kind ===
        "pending"
    ) {
        return NextResponse.json(
            result,
            {
                status: 200,
                headers: {
                    "Cache-Control":
                        "private, no-store",
                },
            }
        );
    }

    return NextResponse.json(
        result,
        {
            status: 200,
            headers: {
                "Cache-Control":
                    "private, no-store",
            },
        }
    );
}

