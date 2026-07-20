import {
    connection,
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

export async function GET(
    req: NextRequest,
) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ---------- Params ---------- */

        const searchParams =
            req.nextUrl.searchParams;

        const page = Number(
            searchParams.get("page") ??
            "1",
        );

        const limit = Number(
            searchParams.get("limit") ??
            "10",
        );

        const search =
            searchParams
                .get("search")
                ?.trim() ?? "";

        const role =
            searchParams
                .get("role")
                ?.trim() ?? "";

        const status =
            searchParams
                .get("status")
                ?.trim() ?? "";

        /* ---------- Safe Pagination ---------- */

        const safePage =
            Number.isNaN(page) ||
                page < 1
                ? 1
                : page;

        const safeLimit =
            Number.isNaN(limit) ||
                limit < 1
                ? 10
                : Math.min(limit, 100);

        const from =
            (safePage - 1) *
            safeLimit;

        const to =
            from + safeLimit - 1;

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        let query = supabase
            .from("users")
            .select(
                `
          id,
    full_name,
    email,
    phone,
    role,
    status,
    qualification,
    bio,
    guardian_name,
    guardian_phone,
    guardian_email,
    created_at
        `,
                {
                    count: "exact",
                },
            );

        /* ---------- Search ---------- */

        if (search.length > 0) {
            query = query.or(
                `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
            );
        }

        /* ---------- Role Filter ---------- */

        if (role.length > 0) {
            query = query.eq(
                "role",
                role,
            );
        }

        /* ---------- Status Filter ---------- */

        if (status.length > 0) {
            query = query.eq(
                "status",
                status,
            );
        }

        /* ---------- Fetch ---------- */

        const {
            data,
            error,
            count,
        } = await query
            .order("created_at", {
                ascending: false,
            })
            .range(from, to);

        if (error) {
            throw new Error(
                error.message,
            );
        }

        /* ---------- Response ---------- */

        return NextResponse.json({
            data: data ?? [],

            page: safePage,

            limit: safeLimit,

            totalPages: Math.ceil(
                (count ?? 0) /
                safeLimit,
            ),

            totalCount:
                count ?? 0,
        });
    } catch (error) {
        console.error(
            "Failed to fetch users:",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch users",
            },
            {
                status: 500,
            },
        );
    }
}
