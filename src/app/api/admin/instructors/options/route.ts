import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

export type InstructorOption = {
    id: string;

    full_name: string;
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

        const { data, error } =
            await supabase
                .from("users")
                .select(
                    "id, full_name",
                )
                .in("role", [
                    "teacher",
                    "admin",
                ])
                .eq(
                    "status",
                    "active",
                )
                .order(
                    "full_name",
                    {
                        ascending: true,
                    },
                );

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
            data satisfies InstructorOption[],
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load staff",
            },
            {
                status: 500,
            },
        );
    }
}
