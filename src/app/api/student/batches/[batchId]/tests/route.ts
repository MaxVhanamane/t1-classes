import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { TEST_GRACE_TIME_IN_SECONDS } from "@/src/lib/constants/rpc-constants";

type AttemptStatus = "none" | "in_progress" | "submitted" | "expired";
type TestStatus = "ongoing" | "scheduled" | "completed";

type BatchTestRpcRow = {
    distribution_id: string;
    test_id: string;
    title: string;
    test_type: "standard" | "sectioned";
    total_marks: number;
    total_questions: number;
    subject_labels: string[] | null; // <-- NEW
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
    status: TestStatus;
    attempt_id: string | null;
    attempt_status: AttemptStatus | null;
    attempt_started_at: string | null;
    time_limit_seconds: number | null;
    is_attempt_expired: boolean;
    is_result_unlocked: boolean;
    total_count: number;
};

export async function GET(
    req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    await connection();
    const auth = await requireStudentApiRoute();
    if (!auth.authorized) return auth.response;

    const supabase = await createServerSupabaseClient();
    const batchId = (await params).batchId;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const status = (searchParams.get("status") as TestStatus | null) ?? "ongoing";

    if (status !== "ongoing" && status !== "scheduled" && status !== "completed") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const limit = 10;

    const { data, error } = await supabase.rpc("get_student_batch_tests", {
        p_student_id: auth.user.userId,
        p_batch_id: batchId,
        p_test_grace_time_seconds: TEST_GRACE_TIME_IN_SECONDS,
        p_status: status,
        p_page: page,
        p_limit: limit,
    });

    if (error) {
        console.error("[FETCH_BATCH_TESTS_ERROR]", error);
        return NextResponse.json(
            { error: error.message === "Access denied" ? "Access denied" : "Failed to load tests" },
            { status: error.message === "Access denied" ? 403 : 500 }
        );
    }

    const rows = (data as BatchTestRpcRow[] | null) ?? [];
    const total = rows[0]?.total_count ?? 0;

    return NextResponse.json({
        items: rows.map((row) => ({
            distributionId: row.distribution_id,
            testId: row.test_id,
            title: row.title,
            testType: row.test_type,
            totalMarks: Number(row.total_marks),
            totalQuestions: row.total_questions,
            subjectLabels: row.subject_labels ?? [],
            startsAt: row.starts_at,
            endsAt: row.ends_at,
            durationMinutes: row.duration_minutes,
            status: row.status,
            isAttemptExpired: row.is_attempt_expired,
            isResultUnlocked: row.is_result_unlocked,
            attempt: {
                status: row.attempt_status ?? "none",
                attemptId: row.attempt_id ?? undefined,
                startedAt: row.attempt_started_at ?? undefined,
                timeLimitSeconds: row.time_limit_seconds ?? undefined,
                attemptsUsed: row.attempt_id ? 1 : 0,
            },
        })),
        page,
        total,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
    });
}
