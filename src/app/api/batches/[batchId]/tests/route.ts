import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getEnrollmentAccess } from "@/src/lib/server/enrollment-access";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

type AttemptStatus =
    | "none"
    | "in_progress"
    | "submitted"
    | "expired";

export type TestDistributionRow = {
    id: string;
    test_id: string;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;

    test: {
        id: string;
        title: string;
        is_active: boolean;
    };

    attempts:
    | {
        id: string;
        status: "in_progress" | "submitted" | "expired";
        started_at: string;
        time_limit_seconds: number;
        user_id: string;
    }[]
    | null;
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {


    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user
    const supabase = await createServerSupabaseClient();

    const batchId = (await params).batchId;

    /* -------------------------------------------- */
    /* Enrollment Gate */
    /* -------------------------------------------- */

    const enrollment = await getEnrollmentAccess(
        supabase,
        user.userId,
        { type: "batch", batchId }
    );

    if (!enrollment.hasAccess) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        );
    }

    /* -------------------------------------------- */
    /* Fetch distributions */
    /* -------------------------------------------- */

    const { data, error } = await supabase
        .from("test_distributions")
        .select(`
      id,
      test_id,
      starts_at,
      ends_at,
      duration_minutes,
      test:tests (
        id,
        title,
        is_active
      ),
      attempts:test_attempts (
        id,
        status,
        started_at,
        time_limit_seconds,
        user_id
      )
    `)
        .eq("batch_id", batchId)
        .eq("test.is_active", true)
        .eq("attempts.user_id", user.userId)
        .order("starts_at", { ascending: true });



    if (error || !data) {
        return NextResponse.json(
            { error: "Failed to load tests" },
            { status: 500 }
        );
    }

    const rows =
        data as unknown as TestDistributionRow[];

    /* -------------------------------------------- */
    /* Normalize — RAW DATA ONLY */
    /* -------------------------------------------- */

    const result = rows.map((row) => {
        const attempt = row.attempts?.[0] ?? null;

        return {
            distributionId: row.id,
            testId: row.test.id,
            title: row.test.title,

            startsAt: row.starts_at,
            endsAt: row.ends_at,
            durationMinutes: row.duration_minutes,

            attempt: {
                status:
                    (attempt?.status as AttemptStatus) ??
                    "none",

                attemptId: attempt?.id,

                startedAt: attempt?.started_at,
                timeLimitSeconds:
                    attempt?.time_limit_seconds,

                attemptsUsed: attempt ? 1 : 0,
            },
        };
    });

    return NextResponse.json(result);
}
