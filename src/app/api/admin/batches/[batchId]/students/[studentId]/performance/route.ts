import { connection, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";


export async function GET(
    req: Request,
    { params }: { params: Promise<{ batchId: string; studentId: string }> }
) {
    await connection();

    const auth = await requireStaffApiRoute(); // Or requireTeacherApiRoute depending on your setup
    if (!auth.authorized) {
        return auth.response;
    }

    const supabase = await createServerSupabaseClient();
    const { batchId, studentId } = await params;

    const { data, error } = await supabase.rpc(
        "get_student_batch_performance",
        {
            p_student_id: studentId, // Using the explicit student ID from the URL
            p_batch_id: batchId,
        }
    );

    if (error) {
        console.error("[FETCH_ADMIN_BATCH_PERFORMANCE_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to load performance data" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
