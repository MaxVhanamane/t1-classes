import { NextRequest, NextResponse } from "next/server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";
import { getEnrollmentFeesData } from "@/src/app/admin/enrollments/[enrollmentId]/fees/_features/actions/get-enrollment-fees-data";


type RouteContext = {
    params: Promise<{
        enrollmentId: string;
    }>;
};

export async function GET(
    _req: NextRequest,
    { params }: RouteContext
) {
    try {
        /* ---------------------------------- */
        /* Authorization                      */
        /* ---------------------------------- */

        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------------------------------- */
        /* Params                             */
        /* ---------------------------------- */

        const { enrollmentId } =
            await params;

        /* ---------------------------------- */
        /* Data                               */
        /* ---------------------------------- */

        const data =
            await getEnrollmentFeesData(
                enrollmentId
            );

        /* ---------------------------------- */
        /* Success                            */
        /* ---------------------------------- */

        return NextResponse.json(
            data
        );
    } catch (error) {
        console.error(
            "[ENROLLMENT_FEES_API]",
            error
        );

        return NextResponse.json(
            {
                error:
                    "FAILED_TO_LOAD_ENROLLMENT_FEES",
            },
            {
                status: 500,
            }
        );
    }
}
