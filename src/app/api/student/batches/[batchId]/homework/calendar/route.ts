import { connection, NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import type { HomeworkCalendarResponse } from "@/src/app/student/learn/batches/[batchId]/_features/types/homework.types";

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

    // Default to current month and year if not provided
    const currentDate = new Date();
    const year = parseInt(searchParams.get("year") ?? currentDate.getFullYear().toString());
    const month = parseInt(searchParams.get("month") ?? (currentDate.getMonth() + 1).toString());

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    // Calculate exact start and end of the requested month
    // Note: JS Date month is 0-indexed (0 = Jan, 11 = Dec)
    const targetDate = new Date(year, month - 1, 1);
    const startDate = startOfMonth(targetDate).toISOString();
    const endDate = endOfMonth(targetDate).toISOString();

    const { data, error } = await supabase.rpc("get_student_homework_calendar", {
        p_batch_id: batchId,
        p_start_date: startDate,
        p_end_date: endDate,
    });

    if (error) {
        console.error("[FETCH_HOMEWORK_CALENDAR_ERROR]", error);
        return NextResponse.json(
            { error: error.message === "Access denied" ? "Access denied" : "Failed to load calendar data" },
            { status: error.message === "Access denied" ? 403 : 500 }
        );
    }

    return NextResponse.json((data ?? []) satisfies HomeworkCalendarResponse);
}
