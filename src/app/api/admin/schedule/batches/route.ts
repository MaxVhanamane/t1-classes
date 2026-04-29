import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET() {
    const auth = await requireStaffApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }


    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("batches")
        .select("id, title")
        .eq("is_active", true)
        .order("title");

    if (error) {

        return NextResponse.json(
            { error: "FAILED_TO_FETCH_BATCHES" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
