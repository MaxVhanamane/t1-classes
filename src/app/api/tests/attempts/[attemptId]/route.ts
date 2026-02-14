import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";
import { LoadAttemptResponse } from "./attempt-types";

import {
    getAttemptExpiryMs,
    isAttemptExpired,
} from "@/src/lib/helper-functions/attempt-expiry";

type AttemptRow = {
    id: string;
    test_id: string;
    distribution_id: string;
    user_id: string;
    status: "in_progress" | "submitted" | "expired";
    started_at: string;
    time_limit_seconds: number;
    time_spent_seconds: number;
};

type DistributionRow = {
    id: string;
    batch_id: string | null;
    course_id: string | null;
    starts_at: string;
    ends_at: string;
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentStudent();
    const attemptId = (await params).attemptId;

    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    /* =========================================================
       1. Load attempt
    ========================================================= */

    const { data: attempt, error: attemptError } =
        await supabase
            .from("test_attempts")
            .select(
                `
        id,
        test_id,
        distribution_id,
        user_id,
        status,
        started_at,
        time_limit_seconds,
        time_spent_seconds
      `
            )
            .eq("id", attemptId)
            .single();

    if (attemptError || !attempt) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" } satisfies LoadAttemptResponse,
            { status: 404 }
        );
    }

    const typedAttempt = attempt as AttemptRow;

    /* =========================================================
       2. Ownership gate
    ========================================================= */

    if (typedAttempt.user_id !== user.id) {
        return NextResponse.json(
            { kind: "denied", reason: "not_owner" } satisfies LoadAttemptResponse,
            { status: 200 }
        );
    }

    /* =========================================================
       3. Status gate
    ========================================================= */

    if (typedAttempt.status === "submitted") {
        return NextResponse.json(
            { kind: "denied", reason: "submitted" } satisfies LoadAttemptResponse,
            { status: 200 }
        );
    }

    if (typedAttempt.status === "expired") {
        return NextResponse.json(
            { kind: "denied", reason: "expired" } satisfies LoadAttemptResponse,
            { status: 200 }
        );
    }

    /* =========================================================
       4. Load distribution
    ========================================================= */

    const { data: dist, error: distError } =
        await supabase
            .from("test_distributions")
            .select(
                `
        id,
        batch_id,
        course_id,
        starts_at,
        ends_at
      `
            )
            .eq("id", typedAttempt.distribution_id)
            .single();

    if (distError || !dist) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" } satisfies LoadAttemptResponse,
            { status: 404 }
        );
    }

    const distribution = dist as DistributionRow;

    /* =========================================================
       5. Enrollment gate
    ========================================================= */

    if (distribution.batch_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            {
                type: "batch",
                batchId: distribution.batch_id,
            }
        );

        if (!access.hasAccess) {
            return NextResponse.json(
                { kind: "denied", reason: "not_enrolled" } satisfies LoadAttemptResponse,
                { status: 200 }
            );
        }
    } else if (distribution.course_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            {
                type: "course",
                courseId: distribution.course_id,
            }
        );

        if (!access.hasAccess) {
            return NextResponse.json(
                { kind: "denied", reason: "not_enrolled" } satisfies LoadAttemptResponse,
                { status: 200 }
            );
        }
    }

    /* =========================================================
       6. Distribution time gate
    ========================================================= */

    const startsAtMs = new Date(
        distribution.starts_at
    ).getTime();

    const endsAtMs = new Date(
        distribution.ends_at
    ).getTime();

    if (now < startsAtMs || now >= endsAtMs) {
        return NextResponse.json(
            { kind: "denied", reason: "ended" } satisfies LoadAttemptResponse,
            { status: 200 }
        );
    }

    /* =========================================================
       7. Attempt expiry (USING REUSABLE LOGIC)
    ========================================================= */

    const expiresAtMs = getAttemptExpiryMs(
        typedAttempt,
        distribution
    );

    if (
        isAttemptExpired(
            expiresAtMs,
            now
        )
    ) {
        await supabase
            .from("test_attempts")
            .update({
                status: "expired",
                updated_at: nowIso,
            })
            .eq("id", typedAttempt.id);

        return NextResponse.json(
            { kind: "denied", reason: "expired" } satisfies LoadAttemptResponse,
            { status: 200 }
        );
    }

    /* =========================================================
       8. Load test structure
    ========================================================= */

    const { data: sections } =
        await supabase
            .from("test_sections")
            .select(
                `
        id,
        title,
        description,
        subject_label,
        answer_mode,
        full_marks,
        negative_marks,
        max_selections,
        scoring_question_count,
        questions:test_questions (
          id,
          question_text,
          options:test_question_options (
            id,
            option_label,
            option_text
          )
        )
      `
            )
            .eq("test_id", typedAttempt.test_id)
            .eq("is_active", true)
            .order("sort_order", {
                ascending: true,
            });

    /* =========================================================
       9. Load attempt state
    ========================================================= */

    const { data: states } =
        await supabase
            .from("test_attempt_answers")
            .select(
                `
        question_id,
        answer,
        visited_at,
        marked_for_review
      `
            )
            .eq("attempt_id", typedAttempt.id);

    /* =========================================================
       10. Load test meta
    ========================================================= */

    const { data: test } =
        await supabase
            .from("tests")
            .select("title")
            .eq("id", typedAttempt.test_id)
            .single();

    /* =========================================================
       11. Heartbeat
    ========================================================= */

    await supabase
        .from("test_attempts")
        .update({
            last_activity_at: nowIso,
            updated_at: nowIso,
        })
        .eq("id", typedAttempt.id);

    /* =========================================================
       12. Response
    ========================================================= */

    return NextResponse.json({
        kind: "ok",
        attemptId: typedAttempt.id,
        testId: typedAttempt.test_id,
        distributionId:
            typedAttempt.distribution_id,
        startedAt:
            typedAttempt.started_at,
        expiresAt: new Date(
            expiresAtMs
        ).toISOString(),
        timeLimitSeconds:
            typedAttempt.time_limit_seconds,
        test: {
            title: test?.title ?? "Test",
            sections: (sections ?? []).map(
                (s) => ({
                    id: s.id,
                    title: s.title,
                    subjectLabel:
                        s.subject_label,
                    description:
                        s.description,
                    answerMode:
                        s.answer_mode,
                    fullMarks:
                        s.full_marks,
                    negativeMarks:
                        s.negative_marks,
                    maxSelections:
                        s.max_selections,
                    scoringQuestionCount:
                        s.scoring_question_count,
                    questions: (
                        s.questions ?? []
                    ).map((q) => ({
                        id: q.id,
                        questionText:
                            q.question_text,
                        options: (
                            q.options ?? []
                        ).map((o) => ({
                            id: o.id,
                            label:
                                o.option_label,
                            text:
                                o.option_text,
                        })),
                    })),
                })
            ),
        },
        state: (states ?? []).map(
            (s) => ({
                questionId:
                    s.question_id,
                answer: s.answer,
                visited:
                    s.visited_at !== null,
                markedForReview:
                    s.marked_for_review,
            })
        ),
    } satisfies LoadAttemptResponse);
}
