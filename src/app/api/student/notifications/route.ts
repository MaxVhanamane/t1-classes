import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET() {
    await requireStudentApiRoute();


    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
        "get_student_notifications",
        {
            p_limit_count: 20,
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
