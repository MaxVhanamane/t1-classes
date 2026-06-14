import { NextRequest, NextResponse } from "next/server";

import { getDistributionResultsSummary } from "@/src/app/admin/tests/distributions/[distributionId]/results/_features/server/get-distribution-results-summary";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ distributionId: string }> },
) {
    try {
        const { distributionId } = await params;

        const summary = await getDistributionResultsSummary(
            distributionId,
        );

        return NextResponse.json(summary);
    } catch (error) {
        console.error(
            "[ADMIN_RESULTS_SUMMARY_API]",
            error,
        );

        const message =
            error instanceof Error ? error.message : "";

        if (
            message.includes("NOT_AUTHORIZED") ||
            message.includes("NOT_AUTHENTICATED")
        ) {
            return NextResponse.json(
                {
                    error: message,
                },
                {
                    status: 403,
                },
            );
        }

        return NextResponse.json(
            {
                error: "FAILED_TO_LOAD_RESULTS_SUMMARY",
            },
            {
                status: 500,
            },
        );
    }
}
