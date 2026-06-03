import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import {
    UpdateAttendanceSessionValues,
    updateAttendanceSessionSchema,
} from "@/src/app/admin/attendance/_features/zod/attendance.schema";

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
            updateAttendanceSessionSchema.safeParse(
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

        const data: UpdateAttendanceSessionValues =
            parsed.data;

        const supabase =
            await createServerSupabaseClient();
        const { error } =
            await supabase.rpc(
                "save_attendance_records",
                {
                    p_session_id:
                        data.session_id,

                    p_created_by:
                        auth.user.userId,

                    p_records:
                        data.records,
                },
            );

        if (error) {
            console.error(
                "[SAVE_ATTENDANCE_RECORDS]",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to save attendance",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "[SAVE_ATTENDANCE_RECORDS_FATAL]",
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
