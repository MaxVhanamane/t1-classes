import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuth } from "@/src/lib/auth/get-auth";

export async function POST() {
    const user = await getAuth();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

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
