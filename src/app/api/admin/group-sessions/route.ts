import {
    connection,
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }


        /* ---------- Params ---------- */

        const searchParams = req.nextUrl.searchParams;

        const page = Number(searchParams.get("page") ?? "1");

        const search = searchParams.get("search")?.trim() ?? "";

        const batchId = searchParams.get("batchId") ?? "all";

        const status = searchParams.get("status") ?? "all";

        const audienceType =
            searchParams.get("audienceType") ?? "all";

        const createdBy =
            searchParams.get("createdBy") ?? "all";

        /* ---------- Safe Pagination ---------- */

        const safePage =
            Number.isNaN(page) || page < 1 ? 1 : page;

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- RPC ---------- */

        const { data, error } = await supabase.rpc(
            "get_admin_group_sessions",
            {
                p_search: search || null,
                p_batch_id:
                    batchId === "all"
                        ? null
                        : batchId,
                p_status: status,
                p_audience_type:
                    audienceType,
                p_created_by:
                    createdBy === "all"
                        ? null
                        : createdBy,
                p_page: safePage,
                p_page_size: PAGE_SIZE,
            },
        );

        if (error) {
            throw error;
        }

        const totalCount =
            data?.[0]?.total_count ?? 0;

        /* ---------- Response ---------- */

        return NextResponse.json({
            data: data ?? [],
            page: safePage,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(
                totalCount / PAGE_SIZE,
            ),
            totalCount,
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
