import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { SaveAnswerBody, SaveAnswerSchema } from "./zod.answer.schema";
import { getAttemptExpiryMs, isAttemptExpired } from "@/src/lib/helper-functions/attempt-expiry";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user
    const supabase = await createServerSupabaseClient();

    const attemptId = (await params).attemptId;
    const nowIso = new Date().toISOString();

    /* ----------------------------- */
    /* 1. Parse Body                 */
    /* ----------------------------- */

    let body: SaveAnswerBody;
    try {
        body = SaveAnswerSchema.parse(await req.json());
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const { questionId, answer, markedForReview } = body;

    /* ----------------------------- */
    /* 2. Load attempt + distribution */
    /*    in ONE query               */
    /* ----------------------------- */

    const { data: attempt } = await supabase
        .from("test_attempts")
        .select(`
            id,
            test_id,
            distribution_id,
            user_id,
            status,
            started_at,
            time_limit_seconds,
            distribution:test_distributions (
                ends_at,
                batch_id
            )
        `)
        .eq("id", attemptId)
        .single();

    if (!attempt) {
        return NextResponse.json(
            { error: "Attempt not found" },
            { status: 404 }
        );
    }

    const distribution = (attempt.distribution as unknown) as {
        ends_at: string;
        batch_id: string | null;
    } | null;

    if (!distribution) {
        return NextResponse.json(
            { error: "Distribution not found" },
            { status: 404 }
        );
    }

    /* ----------------------------- */
    /* 3. Ownership gate             */
    /* ----------------------------- */

    if (attempt.user_id !== user.userId) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 4. Status gate                */
    /* ----------------------------- */

    if (attempt.status !== "in_progress") {
        return NextResponse.json(
            { error: "Attempt is not active" },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 5. Expiry gate                */
    /* ----------------------------- */

    const expiryMs = getAttemptExpiryMs(
        {
            started_at: attempt.started_at,
            time_limit_seconds: attempt.time_limit_seconds,
        },
        { ends_at: distribution.ends_at }
    );

    if (isAttemptExpired(expiryMs)) {
        // fire and forget — don't await, don't block the response
        supabase
            .from("test_attempts")
            .update({ status: "expired" })
            .eq("id", attempt.id)
            .then(() => { });

        return NextResponse.json(
            { error: "Attempt expired" },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 6. Upsert answer              */
    /*    (FK will reject bad IDs)   */
    /* ----------------------------- */

    const { error: upsertError } = await supabase
        .from("test_attempt_answers")
        .upsert(
            {
                attempt_id: attempt.id,
                question_id: questionId,
                answer: answer,
                answered_at: nowIso,
                marked_for_review: markedForReview ?? false,
            },
            {
                onConflict: "attempt_id,question_id",
            }
        );

    if (upsertError) {
        // FK violation means bad question ID — return 400 not 500
        if (upsertError.code === "23503") {
            return NextResponse.json(
                { error: "Invalid question" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to save answer" },
            { status: 500 }
        );
    }

    /* ----------------------------- */
    /* 7. Success                    */
    /* ----------------------------- */

    return NextResponse.json({
        ok: true,
        attemptId: attempt.id,
        questionId,
        savedAt: nowIso,
        markedForReview: markedForReview ?? false,
    });
}
