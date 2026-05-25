import {
    connection,
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

export async function GET(
    req: NextRequest,
) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const { user } = auth;

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
            .from("group_sessions")
            .select("*", {
                count: "exact",
            });

        /* ---------- Teacher Scope ---------- */

        if (
            user.role ===
            "teacher"
        ) {
            query = query.eq(
                "created_by",
                user.userId,
            );
        }

        /* ---------- Search ---------- */

        if (
            search.length > 0
        ) {
            query = query.ilike(
                "title",
                `%${search}%`,
            );
        }

        /* ---------- Fetch ---------- */

        const {
            data,
            error,
            count,
        } = await query
            .order("starts_at", {
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

            totalPages: Math.ceil(
                (count ?? 0) /
                safeLimit,
            ),

            totalCount:
                count ?? 0,
        });
    } catch (error) {
        console.error(
            "Failed to fetch group sessions:",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to fetch group sessions",
            },
            {
                status: 500,
            },
        );
    }
}
