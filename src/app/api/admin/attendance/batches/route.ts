import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import { AttendanceBatchOption } from "@/src/app/admin/attendance/_features/types/attendance";

type BatchRow = {
    id: string;

    title: string;
};

type BatchInstructorRow = {
    batch: {
        id: string;

        title: string;
    } | null;
};

export async function GET() {
    try {
        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const supabase =
            await createServerSupabaseClient();

        const isAdmin =
            auth.user.role === "admin";

        if (isAdmin) {
            const {
                data,
                error,
            } = await supabase
                .from("batches")
                .select(
                    "id, title",
                )
                .eq(
                    "is_active",
                    true,
                )
                .order(
                    "title",
                    {
                        ascending: true,
                    },
                )
                .overrideTypes<
                    BatchRow[],
                    { merge: false }
                >();

            if (error) {
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

            return NextResponse.json(
                data satisfies AttendanceBatchOption[],
            );
        }

        const {
            data,
            error,
        } = await supabase
            .from(
                "batch_instructors",
            )
            .select(`
                batch:batches (
                    id,
                    title
                )
            `)
            .eq(
                "instructor_id",
                auth.user.userId,
            )
            .overrideTypes<
                BatchInstructorRow[],
                { merge: false }
            >();

        if (error) {
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

        const batches =
            data
                ?.flatMap((row) =>
                    row.batch
                        ? [row.batch]
                        : [],
                )
                .sort((a, b) =>
                    a.title.localeCompare(
                        b.title,
                    ),
                ) ?? [];

        return NextResponse.json(
            batches satisfies AttendanceBatchOption[],
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load batches",
            },
            {
                status: 500,
            },
        );
    }
}
