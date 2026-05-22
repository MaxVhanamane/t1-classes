import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";


export async function GET() {
    await connection();
    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase
            .from("batches")
            .select(`
        id,
        title
      `)
            .eq("is_active", true)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            throw new Error(
                error.message,
            );
        }

        /* ---------- Response ---------- */

        return NextResponse.json(
            data ?? [],
        );
    } catch (error) {
        console.error(
            "[MENTORSHIP_BATCHES_GET]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch batches",
            },
            {
                status: 500,
            },
        );
    }
}
