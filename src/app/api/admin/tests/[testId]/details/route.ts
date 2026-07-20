import { connection, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type { TestBuilderTest } from "@/src/app/admin/tests/[testId]/_features/types/test-builder.types";
import type { TestSection } from "@/src/app/admin/tests/[testId]/_features/types/test-section.types";

type TestBuilderDetailsResponse = {
    test: TestBuilderTest & {
        createdBy: string | null;
    };

    totalMarks: number;
    totalQuestions: number;

    sections: (TestSection & {
        sectionTotalQuestions: number;
        sectionTotalMarks: number;
    })[];
};

export async function GET(
    _: Request,
    {
        params,
    }: {
        params: Promise<{
            testId: string;
        }>;
    },
) {
    await connection();

    try {
        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const { testId } = await params;

        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase.rpc(
            "get_test_builder_details",
            {
                p_test_id: testId,
                p_user_id: auth.user.userId,
                p_is_admin: auth.user.role === "admin",
            },
        );

        const result =
            data as TestBuilderDetailsResponse | null;

        if (error || !result) {
            return NextResponse.json(
                {
                    message: "Test not found",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "[ADMIN_TEST_DETAILS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message: "Failed to load test details",
            },
            {
                status: 500,
            },
        );
    }
}
