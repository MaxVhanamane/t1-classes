import {
    connection,
    NextResponse,
} from "next/server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type {
    DistributionQueryParams,
    DistributionStatus,
} from "@/src/app/admin/tests/distributions/_features/types/distribution.types";

import { getDistributions } from "@/src/app/admin/tests/distributions/_features/server/get-distributions";

export async function GET(
    request: Request,
) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        if (!auth.user.role) {
            return NextResponse.json(
                {
                    message:
                        "Failed to determine user role",
                },
                {
                    status: 403,
                },
            );
        }

        /* ---------- Search Params ---------- */

        const { searchParams } =
            new URL(request.url);

        const search =
            searchParams
                .get("search")
                ?.trim() ?? "";

        const createdBy =
            searchParams.get(
                "createdBy",
            ) ?? "me";

        const status =
            (searchParams.get(
                "status",
            ) ??
                "scheduled") as DistributionStatus;

        const page = Math.max(
            1,
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
        );

        /* ---------- Data ---------- */

        const data =
            await getDistributions(
                {
                    search,

                    createdBy,

                    status,

                    page,
                } satisfies DistributionQueryParams,

                {
                    userId:
                        auth.user.userId,

                    role:
                        auth.user.role,
                },
            );

        return NextResponse.json(
            data,
        );
    } catch (error) {
        console.error(
            "[ADMIN_DISTRIBUTIONS_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load distributions",
            },
            {
                status: 500,
            },
        );
    }
}
