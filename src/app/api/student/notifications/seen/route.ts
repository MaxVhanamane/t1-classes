import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export async function POST() {
    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const user = auth.user

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("user_notification_state")
        .upsert(
            {
                user_id: user.userId,
                last_seen: new Date().toISOString(),
            },
            {
                onConflict: "user_id",
            }
        );

    if (error) {
        console.error("FAILED_TO_UPDATE_LAST_SEEN", error);

        return NextResponse.json(
            { error: "FAILED_TO_UPDATE_LAST_SEEN" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
