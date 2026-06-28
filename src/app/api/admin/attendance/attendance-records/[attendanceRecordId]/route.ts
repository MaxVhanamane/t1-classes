import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

type RouteParams = {
    params: Promise<{
        attendanceRecordId: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    { params }: RouteParams,
) {
    try {

        await requireStaffApiRoute();


        const {
            attendanceRecordId,
        } = await params;

        const body =
            (await request.json()) as {
                status?: string;
            };

        if (
            body.status !== "present" &&
            body.status !== "absent"
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid attendance status",
                },
                {
                    status: 400,
                },
            );
        }

        const supabase =
            await createServerSupabaseClient();

        const { data, error } = await supabase.rpc(
            "update_attendance_record",
            {
                p_attendance_record_id: attendanceRecordId,
                p_status: body.status,
            },
        );

        if (error) {
            return NextResponse.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 400,
                },
            );
        }

        return NextResponse.json(
            data,
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to update attendance",
            },
            {
                status: 500,
            },
        );
    }
}
