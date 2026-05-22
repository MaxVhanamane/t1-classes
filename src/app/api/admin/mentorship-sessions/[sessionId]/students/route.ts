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
            sessionId: string;
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

        const { user } = auth;

        /* ---------- Params ---------- */

        const { sessionId } =
            await params;

        if (!sessionId) {
            return NextResponse.json(
                {
                    message:
                        "sessionId required",
                },
                {
                    status: 400,
                },
            );
        }

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Verify Session Access ---------- */

        let sessionQuery =
            supabase
                .from(
                    "mentorship_sessions",
                )
                .select(`
          id,
          created_by,
          audience_type
        `)
                .eq("id", sessionId);

        if (
            user.role ===
            "teacher"
        ) {
            sessionQuery =
                sessionQuery.eq(
                    "created_by",
                    user.userId,
                );
        }

        const {
            data: session,
            error: sessionError,
        } = await sessionQuery
            .maybeSingle();

        if (
            sessionError ||
            !session
        ) {
            return NextResponse.json(
                {
                    message:
                        "Mentorship session not found",
                },
                {
                    status: 404,
                },
            );
        }

        /* ---------- Batch Audience ---------- */

        if (
            session.audience_type ===
            "batch"
        ) {
            return NextResponse.json(
                [],
            );
        }

        /* ---------- Fetch Students ---------- */

        const {
            data,
            error,
        } = await supabase
            .from(
                "mentorship_session_students",
            )
            .select("student_id")
            .eq(
                "session_id",
                sessionId,
            );

        if (error) {
            throw new Error(
                error.message,
            );
        }

        /* ---------- Response ---------- */

        return NextResponse.json(
            data.map(
                (student) =>
                    student.student_id,
            ),
        );
    } catch (error) {
        console.error(
            "Failed to fetch mentorship session students:",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch mentorship session students",
            },
            {
                status: 500,
            },
        );
    }
}
