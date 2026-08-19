import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import {
    HomeworkStatus,
    StudentHomeworkResponse,
    StudentHomeworkRow
} from "@/src/app/student/learn/batches/[batchId]/_features/types/homework.types";

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
    const status = (searchParams.get("status") as HomeworkStatus | null) ?? "ongoing";

    if (status !== "ongoing" && status !== "scheduled" && status !== "completed") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const limit = 10;

    const { data, error } = await supabase.rpc("get_student_batch_homework", {
        p_batch_id: batchId,
        p_status: status,
        p_page: page,
        p_limit: limit,
    });

    if (error) {
        console.error("[FETCH_BATCH_HOMEWORK_ERROR]", error);
        return NextResponse.json(
            { error: error.message === "Access denied" ? "Access denied" : "Failed to load homework" },
            { status: error.message === "Access denied" ? 403 : 500 }
        );
    }

    // Safely cast to your specific row type instead of any[]
    const rpcData = data as { items: StudentHomeworkRow[]; total: number };
    const total = rpcData.total ?? 0;

    return NextResponse.json({
        items: rpcData.items ?? [],
        page,
        total,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
    } satisfies StudentHomeworkResponse);
}
