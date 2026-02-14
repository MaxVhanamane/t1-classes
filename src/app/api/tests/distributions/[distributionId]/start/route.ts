import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStudent } from "@/src/lib/helper-functions/getCurrentStudent";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";

type DistributionRow = {
    id: string;
    test_id: string;
    batch_id: string | null;
    course_id: string | null;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
    max_attempts: number;
};

type AttemptRow = {
    id: string;
    status: "in_progress" | "submitted" | "expired";
    started_at: string;
    time_limit_seconds: number;
};

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ distributionId: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentStudent();
    const distributionId = (await params).distributionId;

    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    /* ------------------------------------------------ */
    /* 1. Load distribution                             */
    /* ------------------------------------------------ */

    const { data: dist, error } = await supabase
        .from("test_distributions")
        .select(
            `
      id, test_id, batch_id, course_id,
      starts_at, ends_at,
      duration_minutes, max_attempts
    `
        )
        .eq("id", distributionId)
        .single();

    if (error || !dist) {
        return NextResponse.json(
            { kind: "denied", reason: "not_started" },
            { status: 404 }
        );
    }

    const distribution = dist as DistributionRow;

    /* ------------------------------------------------ */
    /* 2. Enrollment gate                               */
    /* ------------------------------------------------ */

    if (distribution.batch_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            { type: "batch", batchId: distribution.batch_id }
        );

        if (!access.hasAccess) {
            return NextResponse.json(
                { kind: "denied", reason: "not_enrolled" },
                { status: 403 }
            );
        }
    } else if (distribution.course_id) {
        const access = await getEnrollmentAccess(
            supabase,
            user.id,
            { type: "course", courseId: distribution.course_id }
        );

        if (!access.hasAccess) {
            return NextResponse.json(
                { kind: "denied", reason: "not_enrolled" },
                { status: 403 }
            );
        }
    } else {
        return NextResponse.json(
            { kind: "denied", reason: "not_enrolled" },
            { status: 403 }
        );
    }

    /* ------------------------------------------------ */
    /* 3. Time gate                                     */
    /* ------------------------------------------------ */

    const startsAt = new Date(distribution.starts_at).getTime();
    const endsAt = new Date(distribution.ends_at).getTime();

    if (now < startsAt) {
        return NextResponse.json(
            { kind: "denied", reason: "Test has not started yet!" },
            { status: 403 }
        );
    }

    if (now >= endsAt) {
        return NextResponse.json(
            { kind: "denied", reason: "Test has ended!" },
            { status: 403 }
        );
    }

    /* ------------------------------------------------ */
    /* 4. Existing attempts                             */
    /* ------------------------------------------------ */

    const { data: attempts } = await supabase
        .from("test_attempts")
        .select(
            `id, status, started_at, time_limit_seconds`
        )
        .eq("distribution_id", distributionId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const typedAttempts = (attempts ?? []) as AttemptRow[];

    const inProgress = typedAttempts.find(
        (a) => a.status === "in_progress"
    );

    /* ------------------------------------------------ */
    /* Resume                                           */
    /* ------------------------------------------------ */

    if (inProgress) {
        return NextResponse.json({
            kind: "resumed",
            attemptId: inProgress.id,
        });
    }

    /* ------------------------------------------------ */
    /* 5. Max attempts                                  */
    /* ------------------------------------------------ */

    const completedCount = typedAttempts.filter(
        (a) =>
            a.status === "submitted" ||
            a.status === "expired"
    ).length;

    if (
        completedCount >= distribution.max_attempts
    ) {
        return NextResponse.json(
            {
                kind: "denied",
                reason: "max_attempts_reached",
            },
            { status: 403 }
        );
    }

    /* ------------------------------------------------ */
    /* 6. Create attempt                                */
    /* ------------------------------------------------ */

    const timeLimitSeconds =
        distribution.duration_minutes * 60;

    const { data: created, error: createError } =
        await supabase
            .from("test_attempts")
            .insert({
                test_id: distribution.test_id,
                distribution_id: distribution.id,
                user_id: user.id,
                started_at: nowIso,
                last_activity_at: nowIso,
                time_limit_seconds: timeLimitSeconds,
                status: "in_progress",
            })
            .select(
                `id, started_at, time_limit_seconds`
            )
            .single();

    /* ------------------------------------------------ */
    /* Fallback resume                                  */
    /* ------------------------------------------------ */

    if (createError || !created) {
        const { data: fallback } =
            await supabase
                .from("test_attempts")
                .select(
                    `id, started_at, time_limit_seconds`
                )
                .eq(
                    "distribution_id",
                    distributionId
                )
                .eq("user_id", user.id)
                .eq("status", "in_progress")
                .single();

        if (!fallback) {
            return NextResponse.json(
                {
                    kind: "denied",
                    reason: "not_started",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            kind: "resumed",
            attemptId: fallback.id,
        });
    }

    /* ------------------------------------------------ */
    /* 7. Success                                       */
    /* ------------------------------------------------ */

    return NextResponse.json({
        kind: "started",
        attemptId: created.id,
    });
}
