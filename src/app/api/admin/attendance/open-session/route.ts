import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import {
    CreateAttendanceSessionValues,
    createAttendanceSessionSchema,
} from "@/src/app/admin/attendance/_features/zod/attendance.schema";

import { CreateAttendanceSessionResponse } from "@/src/app/admin/attendance/_features/types/attendance";

export async function POST(
    request: Request,
) {
    try {
        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const body: unknown =
            await request.json();

        const parsed =
            createAttendanceSessionSchema.safeParse(
                body,
            );

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message:
                        parsed.error
                            .issues[0]
                            ?.message ??
                        "Invalid attendance data",
                },
                {
                    status: 400,
                },
            );
        }

        const data: CreateAttendanceSessionValues =
            parsed.data;

        const supabase =
            await createServerSupabaseClient();

        const {
            data: rpcData,
            error,
        } = await supabase.rpc(
            "create_attendance_session",
            {
                p_batch_id:
                    data.batch_id,

                p_created_by:
                    auth.user.userId,
            },
        );

        if (
            error ||
            !rpcData?.length
        ) {
            console.error(
                "[OPEN_ATTENDANCE_SESSION]",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to open attendance session",
                },
                {
                    status: 500,
                },
            );
        }

        const response: CreateAttendanceSessionResponse =
        {
            sessionId:
                rpcData[0]
                    .session_id,

            created:
                rpcData[0]
                    .created,
        };

        return NextResponse.json(
            response,
        );
    } catch (error) {
        console.error(
            "[OPEN_ATTENDANCE_SESSION_FATAL]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Something went wrong. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}
