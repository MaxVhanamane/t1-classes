import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";

export async function GET() {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
