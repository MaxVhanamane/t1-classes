import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";
import {
    SaveAnswerBody,
    SaveAnswerSchema,
} from "./zod.answer.schema";

import {
    getAttemptExpiryMs,
    isAttemptExpired,
} from "@/src/lib/helper-functions/attempt-expiry";

/* -------------------------------------------- */
/* Types */
/* -------------------------------------------- */

type AttemptRow = {
    id: string;
    test_id: string;
    distribution_id: string;
    user_id: string;
    status: "in_progress" | "submitted" | "expired";
    started_at: string;
    time_limit_seconds: number;
};

type DistributionRow = {
    id: string;
    batch_id: string | null;
    course_id: string | null;
    starts_at: string;
    ends_at: string;
};

/* -------------------------------------------- */
/* Handler */
/* -------------------------------------------- */

export async function PATCH(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            attemptId: string;
        }>;
    }
) {
    const supabase =
        await createServerSupabaseClient();

    const user =
        await getCurrentStudent();

    const attemptId =
        (await params).attemptId;

    const nowIso =
        new Date().toISOString();

    /* ----------------------------- */
    /* 1. Parse Body (ZOD) */
    /* ----------------------------- */

    let body: SaveAnswerBody;

    try {
        body =
            SaveAnswerSchema.parse(
                await req.json()
            );
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const {
        questionId,
        answer,
        markedForReview,
    } = body;

    /* ----------------------------- */
    /* 2. Load Attempt */
    /* ----------------------------- */

    const { data: attempt } =
        await supabase
            .from("test_attempts")
            .select(
                `id, test_id, distribution_id, user_id, status, started_at, time_limit_seconds`
            )
            .eq("id", attemptId)
            .single();

    if (!attempt) {
        return NextResponse.json(
            { error: "Attempt not found" },
            { status: 404 }
        );
    }

    const typedAttempt =
        attempt as AttemptRow;

    /* ----------------------------- */
    /* 3. Ownership Gate */
    /* ----------------------------- */

    if (
        typedAttempt.user_id !==
        user.id
    ) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 4. Status Gate */
    /* ----------------------------- */

    if (
        typedAttempt.status !==
        "in_progress"
    ) {
        return NextResponse.json(
            {
                error:
                    "Attempt is not active",
            },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 5. Load Distribution */
    /* ----------------------------- */

    const { data: dist } =
        await supabase
            .from("test_distributions")
            .select(
                `id, batch_id, course_id, starts_at, ends_at`
            )
            .eq(
                "id",
                typedAttempt.distribution_id
            )
            .single();

    if (!dist) {
        return NextResponse.json(
            {
                error:
                    "Distribution not found",
            },
            { status: 404 }
        );
    }

    const distribution =
        dist as DistributionRow;

    /* ----------------------------- */
    /* 6. Enrollment Gate */
    /* ----------------------------- */

    if (distribution.batch_id) {
        const access =
            await getEnrollmentAccess(
                supabase,
                user.id,
                {
                    type: "batch",
                    batchId:
                        distribution.batch_id,
                }
            );

        if (!access.hasAccess) {
            return NextResponse.json(
                { error: "Not enrolled" },
                { status: 403 }
            );
        }
    } else if (distribution.course_id) {
        const access =
            await getEnrollmentAccess(
                supabase,
                user.id,
                {
                    type: "course",
                    courseId:
                        distribution.course_id,
                }
            );

        if (!access.hasAccess) {
            return NextResponse.json(
                { error: "Not enrolled" },
                { status: 403 }
            );
        }
    }

    /* ----------------------------- */
    /* 7. Time Gate (UPDATED) */
    /* ----------------------------- */

    const expiryMs =
        getAttemptExpiryMs(
            {
                started_at:
                    typedAttempt.started_at,
                time_limit_seconds:
                    typedAttempt.time_limit_seconds,
            },
            {
                ends_at:
                    distribution.ends_at,
            }
        );

    if (isAttemptExpired(expiryMs)) {
        await supabase
            .from("test_attempts")
            .update({
                status: "expired",
            })
            .eq(
                "id",
                typedAttempt.id
            );

        return NextResponse.json(
            { error: "Attempt expired" },
            { status: 403 }
        );
    }

    /* ----------------------------- */
    /* 8. Validate Question */
    /* ----------------------------- */

    const { data: question } =
        await supabase
            .from("test_questions")
            .select("id")
            .eq("id", questionId)
            .eq(
                "test_id",
                typedAttempt.test_id
            )
            .single();

    if (!question) {
        return NextResponse.json(
            { error: "Invalid question" },
            { status: 400 }
        );
    }

    /* ----------------------------- */
    /* 9. Store Answer */
    /* ----------------------------- */

    const normalizedAnswer =
        answer;

    /* ----------------------------- */
    /* 10. UPSERT Answer */
    /* ----------------------------- */

    const { error: upsertError } =
        await supabase
            .from(
                "test_attempt_answers"
            )
            .upsert(
                {
                    attempt_id:
                        typedAttempt.id,
                    question_id:
                        questionId,
                    answer:
                        normalizedAnswer,
                    answered_at: nowIso,
                    marked_for_review:
                        markedForReview ??
                        false,
                },
                {
                    onConflict:
                        "attempt_id,question_id",
                }
            );

    if (upsertError) {
        return NextResponse.json(
            {
                error:
                    "Failed to save answer",
            },
            { status: 500 }
        );
    }

    /* ----------------------------- */
    /* 11. Heartbeat */
    /* ----------------------------- */

    await supabase
        .from("test_attempts")
        .update({
            last_activity_at:
                nowIso,
        })
        .eq(
            "id",
            typedAttempt.id
        );

    /* ----------------------------- */
    /* 12. Success */
    /* ----------------------------- */

    return NextResponse.json({
        ok: true,
        attemptId:
            typedAttempt.id,
        questionId,
        savedAt: nowIso,
        markedForReview:
            markedForReview ??
            false,
    });
}
