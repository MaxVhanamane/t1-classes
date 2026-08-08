import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { LoadAttemptResponse, CachedTestPayload } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { requireStudentServerOnly } from "@/src/lib/auth/claims/require-role-server-only";


type RpcAnswer = {
    question_id: string;
    answer: unknown;
    marked_for_review: boolean;
    time_spent_seconds: number | null;
};

type RpcResponseOk = {
    kind: "ok";
    attempt: {
        id: string;
        test_id: string;
        distribution_id: string;
        started_at: string;
        time_limit_seconds: number;
        expires_at: string;
    };
    distribution: {
        starts_at: string;
        ends_at: string;
    };
    answers: RpcAnswer[];
};

type RpcResponseDenied = {
    kind: "denied";
    reason: "not_owner" | "not_found" | "submitted" | "expired" | "ended";
};

type RpcResponse = RpcResponseOk | RpcResponseDenied;

/* =========================================================
   CACHED TEST PAYLOAD
========================================================= */

async function getCachedTestPayload(
    testId: string,
): Promise<CachedTestPayload> {
    "use cache: remote";

    cacheTag(`test:${testId}`);
    cacheLife("days");
    console.log("getCachedTestPayload called")

    const supabase = createStaticSupabaseClient();

    const { data, error } = await supabase.rpc(
        "get_test_payload",
        {
            p_test_id: testId,
        },
    );

    if (error) {
        throw error;
    }

    return (
        (data as CachedTestPayload | null) ?? {
            title: "Test",
            totalMarks: 0,
            totalSections: 0,
            totalQuestions: 0,
            sections: [],
        }
    );
}

export async function loadAttempt(
    attemptId: string,
): Promise<LoadAttemptResponse> {
    const supabase = await createServerSupabaseClient();
    const user = await requireStudentServerOnly();

    if (!user) {
        return { kind: "denied", reason: "not_owner" };
    }

    /* =========================================================
       FETCH UNIFIED ATTEMPT DATA (SECURITY DEFINER RPC)
    ========================================================= */

    const { data, error } = await supabase.rpc(
        "load_test_attempt_data",
        { p_attempt_id: attemptId }
    );

    if (error || !data) {
        return { kind: "denied", reason: "not_found" };
    }

    // Strongly type the JSONB response
    const rpcResponse = data as RpcResponse;

    if (rpcResponse.kind === "denied") {
        return { kind: "denied", reason: rpcResponse.reason };
    }

    /* =========================================================
       LOAD CACHED TEST PAYLOAD
    ========================================================= */

    const testPayload = await getCachedTestPayload(rpcResponse.attempt.test_id);

    /* =========================================================
       RESPONSE
    ========================================================= */

    return {
        kind: "ok",
        attemptId: rpcResponse.attempt.id,
        testId: rpcResponse.attempt.test_id,
        distributionId: rpcResponse.attempt.distribution_id,
        startedAt: rpcResponse.attempt.started_at,
        expiresAt: new Date(rpcResponse.attempt.expires_at).toISOString(),
        timeLimitSeconds: rpcResponse.attempt.time_limit_seconds,
        test: testPayload,
        state: rpcResponse.answers.map((state) => ({
            questionId: state.question_id,
            answer: state.answer,
            visited: false,
            markedForReview: state.marked_for_review,
            timeSpentSeconds: state.time_spent_seconds ?? 0,
        })),
    };
}
