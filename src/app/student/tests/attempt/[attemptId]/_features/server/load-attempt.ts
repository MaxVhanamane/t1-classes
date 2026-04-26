import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { LoadAttemptResponse } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";
import { getAttemptExpiryMs, isAttemptExpired } from "@/src/lib/helper-functions/attempt-expiry";
import { getAuth } from "@/src/lib/auth/get-auth";

export async function loadAttempt(attemptId: string): Promise<LoadAttemptResponse> {
    const supabase = await createServerSupabaseClient();
    const user = await getAuth();
    if (!user) {
        return { kind: "denied", reason: "not_owner" };
    }

    const now = Date.now();


    /* =========================================================
       1. Load attempt + distribution + test title in ONE query
    ========================================================= */
    const { data: attempt, error: attemptError } = await supabase
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
            time_spent_seconds,
            distribution:test_distributions (
                id,
                batch_id,
                starts_at,
                ends_at
            ),
            test:tests (
                title
            )
            `
        )
        .eq("id", attemptId)
        .single();

    if (attemptError || !attempt) {
        return { kind: "denied", reason: "not_found" };
    }

    const distribution = (attempt.distribution as unknown) as {
        id: string;
        batch_id: string | null;
        starts_at: string;
        ends_at: string;
    } | null;

    const test = (attempt.test as unknown) as { title: string } | null;

    if (!distribution) {
        return { kind: "denied", reason: "not_found" };
    }

    /* =========================================================
       2. Ownership gate
    ========================================================= */

    if (attempt.user_id !== user.userId) {
        return { kind: "denied", reason: "not_owner" };
    }

    /* =========================================================
       3. Status gate
    ========================================================= */

    if (attempt.status === "submitted") {
        return { kind: "denied", reason: "submitted" };
    }

    if (attempt.status === "expired") {
        return { kind: "denied", reason: "expired" };
    }

    /* =========================================================
       4. Enrollment gate // To reduce latency removed enrollment check as we already confirm on client
    ========================================================= */
    // if (distribution.batch_id) {
    //     const hasAccess = await hasActiveBatchEnrollment(
    //         supabase,
    //         user.userId,
    //         distribution.batch_id
    //     );

    //     if (!hasAccess) {
    //         return { kind: "denied", reason: "not_enrolled" };
    //     }
    // }

    /* =========================================================
       5. Distribution time gate
    ========================================================= */

    const startsAtMs = new Date(distribution.starts_at).getTime();
    const endsAtMs = new Date(distribution.ends_at).getTime();

    if (now < startsAtMs || now >= endsAtMs) {
        return { kind: "denied", reason: "ended" };
    }

    /* =========================================================
       6. Attempt expiry
    ========================================================= */

    const expiresAtMs = getAttemptExpiryMs(attempt, distribution);

    if (isAttemptExpired(expiresAtMs, now)) {

        return { kind: "denied", reason: "expired" };
    }

    /* =========================================================
       7. Load test sections + attempt answers IN PARALLEL
    ========================================================= */
    const [sectionsResult, statesResult] = await Promise.all([
        supabase
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
            .eq("test_id", attempt.test_id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),

        supabase
            .from("test_attempt_answers")
            .select(`question_id, answer, marked_for_review`)
            .eq("attempt_id", attempt.id),
    ]);

    const sections = sectionsResult.data;
    const states = statesResult.data;

    /* =========================================================
       8. Return
    ========================================================= */

    return {
        kind: "ok",
        attemptId: attempt.id,
        testId: attempt.test_id,
        distributionId: attempt.distribution_id,
        startedAt: attempt.started_at,
        expiresAt: new Date(expiresAtMs).toISOString(),
        timeLimitSeconds: attempt.time_limit_seconds,
        test: {
            title: test?.title ?? "Test",
            sections: (sections ?? []).map((s) => ({
                id: s.id,
                title: s.title,
                subjectLabel: s.subject_label,
                description: s.description,
                answerMode: s.answer_mode,
                fullMarks: s.full_marks,
                negativeMarks: s.negative_marks,
                maxSelections: s.max_selections,
                scoringQuestionCount: s.scoring_question_count,
                questions: (s.questions ?? []).map((q) => ({
                    id: q.id,
                    questionText: q.question_text,
                    options: (q.options ?? []).map((o) => ({
                        id: o.id,
                        label: o.option_label,
                        text: o.option_text,
                    })),
                })),
            })),
        },
        state: (states ?? []).map((s) => ({
            questionId: s.question_id,
            answer: s.answer,
            visited: false,
            markedForReview: s.marked_for_review,
        })),
    };
}
