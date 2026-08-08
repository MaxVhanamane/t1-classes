import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export type SubmitTestResponse =
    | {
        kind: "submitted";
        status?: "submitted" | "expired";
    }
    | {
        kind: "denied";
        reason:
        | "not_found"
        | "not_owner"
        | "submission_window_closed";
    };

export async function POST(
    req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const { attemptId } = await params;
    const body = await req.json().catch(() => ({}));
    const pendingTimes = body?.pendingTimes ?? {};

    const { data: finalStatus, error } = await supabase.rpc(
        "rpc_submit_and_grade_attempt",
        {
            p_attempt_id: attemptId,
            p_grace_seconds: TEST_GRACE_TIME_IN_SECONDS,
            p_pending_times: pendingTimes,
        }
    );

    if (error) {
        console.error("rpc_submit_and_grade_attempt error:", error);

        if (error.message.includes("Attempt not found")) {
            return NextResponse.json(
                { kind: "denied", reason: "not_found" },
                { status: 404 }
            );
        }

        if (error.message.includes("NOT_AUTHORIZED")) {
            return NextResponse.json(
                { kind: "denied", reason: "not_owner" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 500 }
        );
    }

    /* -------------------------------------------
     * SUCCESS MAPPING (In-time OR Expired)
     * -------------------------------------------
     * Both 'submitted' and 'expired' mean the test 
     * was successfully graded by the database. 
     * We let them through to the results page!
     * -----------------------------------------*/
    if (finalStatus === "expired" || finalStatus === "submitted") {
        return NextResponse.json({
            kind: "submitted",
            status: finalStatus,
        } satisfies SubmitTestResponse);
    }

    return NextResponse.json(
        { kind: "denied", reason: "submission_window_closed" },
        { status: 403 }
    );
}
