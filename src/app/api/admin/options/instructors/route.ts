import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import type { InstructorSelectItem } from "@/src/app/admin/batches/_features/types/types";

export type InstructorOption = {
    id: string;

    full_name: string;
};

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
            .from("users")
            .select(`
        id,
        full_name
      `)
            .in("role", [
                "admin",
                "teacher",
            ])
            .eq(
                "status",
                "active",
            )
            .order(
                "full_name",
            )
            .overrideTypes<
                InstructorSelectItem[],
                {
                    merge: false;
                }
            >();

        if (error) {
            throw new Error(
                error.message,
            );
        }

        return NextResponse.json(
            data ?? [],
        );
    } catch (error) {
        console.error(
            "[ADMIN_INSTRUCTOR_OPTIONS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load instructors",
            },
            {
                status: 500,
            },
        );
    }
}
