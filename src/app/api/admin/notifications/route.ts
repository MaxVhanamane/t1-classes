import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET() {

    const auth = await requireStaffApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const staff = auth.user
    const supabase = await createServerSupabaseClient();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let query = supabase
        .from("notifications")
        .select(`
      id,
      title,
      message,
      type,
      created_at,
      batch_id,
      batches(title)
    `)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false });

    // Teachers can only see their own notifications
    if (staff.role === "teacher") {
        query = query.eq("created_by", staff.userId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { error: "FAILED_TO_FETCH_NOTIFICATIONS" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
