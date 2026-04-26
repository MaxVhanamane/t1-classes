import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { hasActiveBatchEnrollment } from "@/src/lib/server/enrollment-access";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

type DistributionRow = {
    id: string;
    test_id: string;
    batch_id: string | null;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
};

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ distributionId: string }> }
) {
    const supabase = await createServerSupabaseClient();

    /* ------------------------------------------------ */
    /* 0. Auth                                          */
    /* ------------------------------------------------ */

    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user

    const distributionId = (await params).distributionId;

    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    /* ------------------------------------------------ */
    /* 1. Load distribution                             */
    /* ------------------------------------------------ */

    const { data: dist } = await supabase
        .from("test_distributions")
        .select(
            "id, test_id, batch_id, starts_at, ends_at, duration_minutes"
        )
        .eq("id", distributionId)
        .maybeSingle();

    if (!dist) {
        return NextResponse.json(
            { kind: "denied", reason: "not_found" },
            { status: 404 }
        );
    }

    const distribution = dist as DistributionRow;

    /* ------------------------------------------------ */
    /* 2. Enrollment gate                               */
    /* ------------------------------------------------ */

    if (!distribution.batch_id) {
        return NextResponse.json(
            { kind: "denied", reason: "not_enrolled" },
            { status: 403 }
        );
    }

    const hasAccess = await hasActiveBatchEnrollment(
        supabase,
        user.userId,
        distribution.batch_id
    );

    if (!hasAccess) {
        return NextResponse.json(
            { kind: "denied", reason: "not_enrolled" },
            { status: 403 }
        );
    }

    /* ------------------------------------------------ */
    /* 3. Time gate                                     */
    /* ------------------------------------------------ */

    const startsAt = Date.parse(distribution.starts_at);
    const endsAt = Date.parse(distribution.ends_at);

    if (now < startsAt) {
        return NextResponse.json(
            { kind: "denied", reason: "not_started" },
            { status: 403 }
        );
    }

    if (now >= endsAt) {
        return NextResponse.json(
            { kind: "denied", reason: "ended" },
            { status: 403 }
        );
    }

    /* ------------------------------------------------ */
    /* 4. Check existing attempt (FAST + INDEXED)       */
    /* ------------------------------------------------ */

    const { data: existingAttempt } = await supabase
        .from("test_attempts")
        .select("id")
        .eq("distribution_id", distributionId)
        .eq("user_id", user.userId)
        .maybeSingle();

    if (existingAttempt) {
        return NextResponse.json({
            kind: "resumed",
            attemptId: existingAttempt.id,
        });
    }

    /* ------------------------------------------------ */
    /* 5. Create attempt                                */
    /* ------------------------------------------------ */

    const timeLimitSeconds = distribution.duration_minutes * 60;

    const { data: created, error } = await supabase
        .from("test_attempts")
        .insert({
            test_id: distribution.test_id,
            distribution_id: distribution.id,
            user_id: user.userId,
            started_at: nowIso,
            time_limit_seconds: timeLimitSeconds,
            status: "in_progress",
        })
        .select("id")
        .single();

    if (error || !created) {
        // Try to fetch existing attempt (race condition safe)
        const { data: fallback } = await supabase
            .from("test_attempts")
            .select("id")
            .eq("distribution_id", distributionId)
            .eq("user_id", user.userId)
            .maybeSingle();

        if (fallback) {
            return NextResponse.json({
                kind: "resumed",
                attemptId: fallback.id,
            });
        }

        return NextResponse.json(
            { kind: "error", reason: "failed_to_start" },
            { status: 500 }
        );
    }

    /* ------------------------------------------------ */
    /* 6. Success                                       */
    /* ------------------------------------------------ */

    return NextResponse.json({
        kind: "started",
        attemptId: created.id,
    });
}
