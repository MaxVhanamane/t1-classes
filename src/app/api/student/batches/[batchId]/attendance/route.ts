import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            batchId: string;
        }>;
    },
) {
    try {
        await requireStudentApiRoute()
        const { batchId } =
            await params;

        const searchParams =
            request.nextUrl.searchParams;

        const month =
            Number(
                searchParams.get(
                    "month",
                ),
            ) ||
            new Date().getMonth() + 1;

        const year =
            Number(
                searchParams.get(
                    "year",
                ),
            ) ||
            new Date().getFullYear();

        if (
            month < 1 ||
            month > 12
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid month",
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
        } =
            await supabase.rpc(
                "get_my_attendance_overview",
                {
                    p_batch_id: batchId,
                    p_month: month,
                    p_year: year,
                },
            );

        if (error) {
            console.error(
                "GET STUDENT ATTENDANCE ERROR",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to load attendance",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            data,
        );
    } catch (error) {
        console.error(
            "STUDENT ATTENDANCE ROUTE ERROR",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Internal server error",
            },
            {
                status: 500,
            },
        );
    }
}
