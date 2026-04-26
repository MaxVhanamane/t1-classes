import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";
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

        obtainedMarks: number;
        totalMarks: number;
        percentage: number;

        performanceLabel: PerformanceLabelType;
        totalParticipants: number | null;

        correctCount: number;
        partialCorrectCount: number;
        wrongCount: number;
        unansweredCount: number;

        status:
        | "submitted"
        | "expired"
        | "in_progress";

        submittedAt: string;
        rank: number | null;

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
        const status =
            result.reason ===
                "attempt_not_found"
                ? 404
                : 403;

        return NextResponse.json(
            result,
            { status }
        );
    }

    if (
        result.kind ===
        "pending"
    ) {
        return NextResponse.json(
            result,
            { status: 200 }
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





// import { NextResponse } from "next/server";
// import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
// import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";
// import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
// import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

// /* --------------------------------------------- */
// /* Response Types */
// /* --------------------------------------------- */

// export type PerformanceLabelType = "Perfect" | "Excellent" | "Good" | "Average" | "Needs Improvement" | null;

// export type ResultSummaryResponse =
//     | {
//         kind: "ok";
//         attemptId: string;
//         testId: string;
//         distributionId: string;
//         obtainedMarks: number;
//         totalMarks: number;
//         totalParticipants: number | null;
//         percentage: number;
//         performanceLabel: PerformanceLabelType;
//         correctCount: number;
//         partialCorrectCount: number;
//         wrongCount: number;
//         unansweredCount: number;
//         status: "submitted" | "expired" | "in_progress";
//         submittedAt: string;
//         rank: number | null;
//         test: { title: string };
//     }
//     | {
//         kind: "denied";
//         reason: "attempt_not_found" | "not_found" | "not_owner" | "not_enrolled";
//     }
//     | {
//         kind: "pending";
//         message: string;
//     };

// /* --------------------------------------------- */
// /* Row Types */
// /* --------------------------------------------- */

// type AttemptRow = {
//     id: string;
//     test_id: string;
//     distribution_id: string;
//     user_id: string;
//     status: "in_progress" | "submitted" | "expired";
// };

// type ResultRow = {
//     obtained_marks: number;
//     partial_correct_count: number;
//     total_marks: number;
//     correct_count: number;
//     wrong_count: number;
//     unanswered_count: number;
//     performance_label: PerformanceLabelType;
//     total_participants: number;
//     evaluated_at: string;
//     rank: number | null;
// };

// type DistributionRow = {
//     id: string;
//     batch_id: string | null;
// };

// /* --------------------------------------------- */
// /* Handler */
// /* --------------------------------------------- */

// export async function GET(
//     _req: Request,
//     { params }: { params: Promise<{ attemptId: string }> }
// ) {
//     const supabase = await createServerSupabaseClient();

//     /* ------------------------------------------- */
//     /* 0. Auth */
//     /* ------------------------------------------- */

//     const auth = await requireStudentApiRoute();

//     if (!auth.authorized) {
//         return auth.response;
//     }
//     const user = auth.user
//     const { attemptId } = await params;

//     /* ------------------------------------------- */
//     /* 1. Load Attempt */
//     /* ------------------------------------------- */

//     const { data: attempt } = await supabase
//         .from("test_attempts")
//         .select("id, test_id, distribution_id, user_id, status")
//         .eq("id", attemptId)
//         .single();

//     if (!attempt) {
//         return NextResponse.json(
//             { kind: "denied", reason: "attempt_not_found" },
//             { status: 404 }
//         );
//     }

//     const typedAttempt = attempt as AttemptRow;

//     /* ------------------------------------------- */
//     /* 2. Ownership Gate */
//     /* ------------------------------------------- */

//     if (typedAttempt.user_id !== user.userId) {
//         return NextResponse.json(
//             { kind: "denied", reason: "not_owner" },
//             { status: 403 }
//         );
//     }

//     /* ------------------------------------------- */
//     /* 3. Enrollment Gate */
//     /* ------------------------------------------- */

//     const { data: dist } = await supabase
//         .from("test_distributions")
//         .select("id, batch_id")
//         .eq("id", typedAttempt.distribution_id)
//         .single();

//     if (!dist) {
//         return NextResponse.json(
//             { kind: "denied", reason: "not_found" },
//             { status: 404 }
//         );
//     }

//     const distribution = dist as DistributionRow;

//     if (distribution.batch_id) {
//         const access = await getEnrollmentAccess(supabase, user.userId, {
//             type: "batch",
//             batchId: distribution.batch_id,
//         });

//         if (!access.hasAccess) {
//             return NextResponse.json(
//                 { kind: "denied", reason: "not_enrolled" },
//                 { status: 403 }
//             );
//         }
//     }

//     /* ------------------------------------------- */
//     /* 4. Ensure Result Exists (UPDATED LOGIC) */
//     /* ------------------------------------------- */

//     let { data: result } = await supabase
//         .from("test_results")
//         .select("*")
//         .eq("attempt_id", typedAttempt.id)
//         .single();

//     if (!result) {
//         /**
//          * ----------------------------------------------------------
//          * SELF-HEALING AUTO GRADING
//          * ----------------------------------------------------------
//          * If result does not exist it means:
//          *
//          * • Student closed tab
//          * • Autosubmit failed
//          * • Network lost
//          *
//          * We DO NOT call submit RPC directly.
//          *
//          * Instead we run:
//          *   rpc_auto_grade_expired_attempts
//          *
//          * In SINGLE USER MODE.
//          *
//          * This ensures:
//          * • Expiry + grace respected
//          * • Distribution window respected
//          * • No duplicate grading
//          * ----------------------------------------------------------
//          */

//         const { error } = await supabase.rpc("rpc_auto_grade_expired_attempts", {
//             p_distribution_id: typedAttempt.distribution_id,
//             p_user_id: typedAttempt.user_id,
//             p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
//         });


//         if (error?.message.includes("RESULT_NOT_AVAILABLE_YET")) {
//             return NextResponse.json(
//                 {
//                     kind: "pending",
//                     message: "Results will be available after the test window closes.",
//                 },
//                 { status: 200 }
//             );
//         }

//         /**
//          * Retry fetch after auto-grading
//          */
//         const retry = await supabase
//             .from("test_results")
//             .select("*")
//             .eq("attempt_id", typedAttempt.id)
//             .single();

//         result = retry.data;
//     }

//     if (!result) {
//         return NextResponse.json(
//             { kind: "denied", reason: "not_found" },
//             { status: 500 }
//         );
//     }

//     const typedResult = result as ResultRow;

//     /* ------------------------------------------- */
//     /* 5. Load Test Meta */
//     /* ------------------------------------------- */

//     const { data: test } = await supabase
//         .from("tests")
//         .select("title")
//         .eq("id", typedAttempt.test_id)
//         .single();

//     /* ------------------------------------------- */
//     /* 6. Percentage */
//     /* ------------------------------------------- */

//     const percentage =
//         typedResult.total_marks > 0
//             ? Number(
//                 (
//                     (typedResult.obtained_marks /
//                         typedResult.total_marks) *
//                     100
//                 ).toFixed(2)
//             )
//             : 0;

//     /* ------------------------------------------- */
//     /* 7. Response */
//     /* ------------------------------------------- */

//     return NextResponse.json({
//         kind: "ok",
//         attemptId: typedAttempt.id,
//         testId: typedAttempt.test_id,
//         distributionId: typedAttempt.distribution_id,
//         obtainedMarks: typedResult.obtained_marks,
//         totalMarks: typedResult.total_marks,
//         percentage,
//         performanceLabel: typedResult.performance_label,
//         totalParticipants: typedResult.total_participants,
//         correctCount: typedResult.correct_count,
//         partialCorrectCount:
//             typedResult.partial_correct_count,
//         wrongCount: typedResult.wrong_count,
//         unansweredCount:
//             typedResult.unanswered_count,
//         status: typedAttempt.status,
//         submittedAt: typedResult.evaluated_at,
//         rank: typedResult.rank,
//         test: {
//             title: test?.title ?? "Test",
//         },
//     } satisfies ResultSummaryResponse);
// }
