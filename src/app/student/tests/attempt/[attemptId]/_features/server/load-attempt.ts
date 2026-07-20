import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { LoadAttemptResponse, Section } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import {
    getAttemptExpiryMs,
    isAttemptExpired,
} from "@/src/lib/helper-functions/attempt-expiry";
import { createStaticSupabaseClient } from "@/src/lib/supabase/supabase-static";
import { requireStudentServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

/* =========================================================
   CACHED TEST PAYLOAD
========================================================= */

type CachedTestPayload = {
    title: string;
    sections: Section[];
};

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
        return {
            kind: "denied",
            reason: "not_owner",
        };
    }

    const now = Date.now();

    /* =========================================================
       ATTEMPT + DISTRIBUTION
    ========================================================= */

    const { data: attempt, error } = await supabase
        .from("test_attempts")
        .select(`
      id,
      test_id,
      distribution_id,
      user_id,
      status,
      started_at,
      time_limit_seconds,
      time_spent_seconds,
      distribution:test_distributions (
        id,
        batch_id,
        starts_at,
        ends_at
      )
    `)
        .eq("id", attemptId)
        .single();

    if (error || !attempt) {
        return {
            kind: "denied",
            reason: "not_found",
        };
    }

    const distribution = (attempt.distribution as unknown) as {
        id: string;
        batch_id: string | null;
        starts_at: string;
        ends_at: string;
    } | null;

    if (!distribution) {
        return {
            kind: "denied",
            reason: "not_found",
        };
    }

    /* =========================================================
       OWNERSHIP
    ========================================================= */

    if (attempt.user_id !== user.userId) {
        return {
            kind: "denied",
            reason: "not_owner",
        };
    }

    /* =========================================================
       STATUS
    ========================================================= */

    if (attempt.status === "submitted") {
        return {
            kind: "denied",
            reason: "submitted",
        };
    }

    if (attempt.status === "expired") {
        return {
            kind: "denied",
            reason: "expired",
        };
    }

    /* =========================================================
       DISTRIBUTION WINDOW
    ========================================================= */

    const startsAtMs = new Date(
        distribution.starts_at,
    ).getTime();

    const endsAtMs = new Date(
        distribution.ends_at,
    ).getTime();

    if (now < startsAtMs || now >= endsAtMs) {
        return {
            kind: "denied",
            reason: "ended",
        };
    }

    /* =========================================================
       ATTEMPT EXPIRY
    ========================================================= */

    const expiresAtMs = getAttemptExpiryMs(
        attempt,
        distribution,
    );

    if (isAttemptExpired(expiresAtMs, now)) {
        return {
            kind: "denied",
            reason: "expired",
        };
    }

    /* =========================================================
       LOAD CACHED + DYNAMIC DATA
    ========================================================= */

    const [testPayload, statesResult] =
        await Promise.all([
            getCachedTestPayload(
                attempt.test_id,
            ),

            supabase
                .from("test_attempt_answers")
                .select(`
          question_id,
          answer,
          marked_for_review,
          time_spent_seconds
        `)
                .eq("attempt_id", attempt.id),
        ]);

    const states = statesResult.data ?? [];

    /* =========================================================
       RESPONSE
    ========================================================= */

    return {
        kind: "ok",

        attemptId: attempt.id,

        testId: attempt.test_id,

        distributionId:
            attempt.distribution_id,

        startedAt: attempt.started_at,

        expiresAt: new Date(
            expiresAtMs,
        ).toISOString(),

        timeLimitSeconds:
            attempt.time_limit_seconds,

        test: testPayload,

        state: states.map((state) => ({
            questionId: state.question_id,
            answer: state.answer,
            visited: false,
            markedForReview:
                state.marked_for_review,
            timeSpentSeconds:
                state.time_spent_seconds ?? 0,
        })),
    };
}
