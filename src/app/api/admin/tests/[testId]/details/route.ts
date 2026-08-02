import { connection, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type { TestBuilderDetailsResponse } from "@/src/app/admin/tests/[testId]/_features/types/test-builder.types";

// Define the custom error payload shape returned by the Postgres RPC
type RpcErrorResponse = {
    error: string;
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

        // ONLY pass p_test_id. The RPC handles auth internally now.
        const { data, error } = await supabase.rpc(
            "get_test_builder_details",
            {
                p_test_id: testId,
            },
        );

        // Check for Postgres execution errors
        if (error) {
            throw new Error(error.message);
        }

        // Safely cast to a union type of the success response, error response, or null
        const result = data as TestBuilderDetailsResponse | RpcErrorResponse | null;

        // Use the 'in' operator to narrow the type safely without 'any'
        if (!result || "error" in result) {
            const errorMessage = result ? result.error : "Test not found";

            return NextResponse.json(
                {
                    message: errorMessage,
                },
                {
                    status: errorMessage.includes("Access denied") ? 403 : 404,
                },
            );
        }

        // Because of the check above, TypeScript now strictly knows 'result' is TestBuilderDetailsResponse
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
