import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

/* ================================================== */
/* GET — Fetch instructors by course                  */
/* ================================================== */

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> },
) {

    try {
        /* ---------- Auth ---------- */
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                { message: "courseId required" },
                { status: 400 },
            );
        }

        /* ---------- DB ---------- */

        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("course_instructors")
            .select(`
        id,
        name,
        qualification,
        bio,
        avatar_url
      `)
            .eq("course_id", courseId)
            .order("created_at", { ascending: true });


        if (error) {
            throw new Error(error.message);
        }

        /* ---------- Response ---------- */
        return NextResponse.json(data ?? []);
    } catch {
        return NextResponse.json(
            { message: "Failed to fetch instructors" },
            { status: 500 },
        );
    }
}
