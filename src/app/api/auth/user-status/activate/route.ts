import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { NextResponse } from "next/server";

// This is to update invited user's status 
export async function POST() {
    // 1 Get the real authenticated user (RLS-respecting)
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2 Use service role to update status safely
    const adminSupabase = await createServiceRoleSupabaseClient();

    const { error } = await adminSupabase
        .from("users")
        .update({ status: "active" })
        .eq("id", user.id)
        .eq("status", "invited"); // critical guard

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
