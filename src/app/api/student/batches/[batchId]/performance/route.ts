import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    await connection();

    const auth = await requireStudentApiRoute();
    if (!auth.authorized) {
        return auth.response;
    }

    const supabase = await createServerSupabaseClient();
    const batchId = (await params).batchId;

    const { data, error } = await supabase.rpc(
        "get_student_batch_performance",
        {
            p_student_id: auth.user.userId,
            p_batch_id: batchId,
        }
    );

    if (error) {
        console.error("[FETCH_BATCH_PERFORMANCE_ERROR]", error);
        return NextResponse.json(
            {
                error:
                    error.message === "Access denied"
                        ? "Access denied"
                        : "Failed to load performance data",
            },
            {
                status: error.message === "Access denied" ? 403 : 500,
            }
        );
    }

    return NextResponse.json(data);
}
