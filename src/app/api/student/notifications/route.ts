import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET() {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user

    const supabase = await createServerSupabaseClient();

    // last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data, error } = await supabase.rpc(
        "get_student_notifications",
        {
            student_id: user.userId,
            since: since.toISOString(),
            limit_count: 20,
        }
    );

    if (error) {
        console.error(error);

        return NextResponse.json(
            { error: "FAILED_TO_FETCH_NOTIFICATIONS" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
