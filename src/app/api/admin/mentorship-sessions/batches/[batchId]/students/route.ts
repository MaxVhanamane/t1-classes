import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET(
    _req: NextRequest,

    {
        params,
    }: {
        params: Promise<{
            batchId: string;
        }>;
    },
) {
    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Params ---------- */

        const { batchId } =
            await params;

        if (!batchId) {
            return NextResponse.json(
                {
                    message:
                        "Batch ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase
            .from("enrollments")
            .select(`
        user_id,
        users!enrollments_user_id_fkey (
          id,
          full_name
        )
      `)
            .eq(
                "target_type",
                "batch",
            )
            .eq(
                "batch_id",
                batchId,
            )
            .eq("is_active", true)
            .lte(
                "access_starts_at",
                new Date().toISOString(),
            )
            .or(
                `access_ends_at.is.null,access_ends_at.gte.${new Date().toISOString()}`,
            );

        if (error) {
            throw new Error(
                error.message,
            );
        }

        /* ---------- Transform ---------- */

        const students =
            (data ?? [])
                .map(
                    (enrollment) =>
                        enrollment.users,
                )
                .filter(Boolean);

        /* ---------- Response ---------- */

        return NextResponse.json(
            students,
        );
    } catch (error) {
        console.error(
            "[MENTORSHIP_BATCH_STUDENTS_GET]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch students",
            },
            {
                status: 500,
            },
        );
    }
}
