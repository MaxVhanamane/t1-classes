import { connection, NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

type AttendanceStudentOption = {
    user_id: string;

    roll_number: number;

    full_name: string;
};

export async function GET(
    request: NextRequest,
) {
    await connection()
    try {
        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const batchId =
            request.nextUrl.searchParams.get(
                "batchId",
            );

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

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase.rpc(
            "get_attendance_students",
            {
                p_batch_id:
                    batchId,

                p_teacher_id:
                    auth.user.role ===
                        "teacher"
                        ? auth.user
                            .userId
                        : null,
            },
        );

        if (error) {
            console.error(
                "ATTENDANCE STUDENTS RPC ERROR",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 500,
                },
            );
        }

        const students: AttendanceStudentOption[] =
            Array.isArray(data)
                ? (data as AttendanceStudentOption[])
                : [];

        return NextResponse.json(
            students,
        );
    } catch (error) {
        console.error(
            "ATTENDANCE STUDENTS ERROR",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load students",
            },
            {
                status: 500,
            },
        );
    }
}
