import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStudentApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export async function POST(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{
            distributionId: string;
        }>;
    },
) {
    /* ------------------------------------------------ */
    /* Auth                                             */
    /* ------------------------------------------------ */

    const auth = await requireStudentApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const { distributionId } = await params;

    const supabase =
        await createServerSupabaseClient();

    /* ------------------------------------------------ */
    /* Start / Resume Attempt                           */
    /* ------------------------------------------------ */

    const { data, error } =
        await supabase.rpc(
            "start_test_attempt",
            {
                p_distribution_id:
                    distributionId,
            },
        );

    if (error) {
        console.error(
            "[START_TEST_ATTEMPT]",
            error,
        );

        return NextResponse.json(
            {
                kind: "error",
                reason: "failed_to_start",
            },
            {
                status: 500,
            },
        );
    }

    /* ------------------------------------------------ */
    /* RPC returns:                                     */
    /*                                                  */
    /* { kind: "started", attemptId }                   */
    /* { kind: "resumed", attemptId }                   */
    /* { kind: "denied", reason }                       */
    /* ------------------------------------------------ */

    if (
        data?.kind === "denied"
    ) {
        const status =
            data.reason === "not_found"
                ? 404
                : 403;

        return NextResponse.json(
            data,
            { status },
        );
    }

    return NextResponse.json(data);
}
