import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
    /* ------------------------------------------ */
    /* Auth                                       */
    /* ------------------------------------------ */

    const auth = await requireStaffApiRoute();
    try {

        if (!auth.authorized) {
            return auth.response;
        }

        const staff = auth.user;

        /* ------------------------------------------ */
        /* Query params                               */
        /* ------------------------------------------ */

        const searchParams = request.nextUrl.searchParams;

        const search =
            searchParams.get("search")?.trim() ?? "";

        const type =
            searchParams.get("type") ?? "all";

        const batchId =
            searchParams.get("batchId") ?? null;

        const page = Math.max(
            Number(searchParams.get("page") ?? "1"),
            1,
        );

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        /* ------------------------------------------ */
        /* Supabase                                   */
        /* ------------------------------------------ */

        const supabase = await createServerSupabaseClient();

        /* ------------------------------------------ */
        /* Queries                                    */
        /* ------------------------------------------ */

        let countQuery = supabase
            .from("notifications")
            .select("id", {
                count: "exact",
                head: true,
            });

        let dataQuery = supabase
            .from("notifications")
            .select(`
        id,
        title,
        message,
        type,
        created_at,
        batch_id,
        batches (
          title
        )
      `);

        /* ------------------------------------------ */
        /* Teacher restriction                        */
        /* ------------------------------------------ */

        if (staff.role === "teacher") {
            countQuery = countQuery.eq(
                "created_by",
                staff.userId,
            );

            dataQuery = dataQuery.eq(
                "created_by",
                staff.userId,
            );
        }

        /* ------------------------------------------ */
        /* Search                                     */
        /* ------------------------------------------ */

        if (search) {
            countQuery = countQuery.or(
                `title.ilike.%${search}%,message.ilike.%${search}%`,
            );

            dataQuery = dataQuery.or(
                `title.ilike.%${search}%,message.ilike.%${search}%`,
            );
        }

        /* ------------------------------------------ */
        /* Type                                       */
        /* ------------------------------------------ */

        if (type !== "all") {
            countQuery = countQuery.eq(
                "type",
                type,
            );

            dataQuery = dataQuery.eq(
                "type",
                type,
            );
        }

        /* ------------------------------------------ */
        /* Batch                                      */
        /* ------------------------------------------ */

        if (batchId) {
            countQuery = countQuery.eq(
                "batch_id",
                batchId,
            );

            dataQuery = dataQuery.eq(
                "batch_id",
                batchId,
            );
        }

        /* ------------------------------------------ */
        /* Execute                                    */
        /* ------------------------------------------ */

        const [countResult, dataResult] =
            await Promise.all([
                countQuery,
                dataQuery
                    .order("created_at", {
                        ascending: false,
                    })
                    .range(from, to),
            ]);

        if (countResult.error) {
            throw new Error(countResult.error.message);
        }

        if (dataResult.error) {
            throw new Error(dataResult.error.message);
        }

        /* ------------------------------------------ */
        /* Response                                   */
        /* ------------------------------------------ */

        const total = countResult.count ?? 0;

        return NextResponse.json({
            items: dataResult.data ?? [],
            page,
            total,
            totalPages: Math.ceil(total / PAGE_SIZE),
            pageSize: PAGE_SIZE,
        });
    } catch (error) {
        console.error(
            "[ADMIN_NOTIFICATIONS_GET_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message: "Failed to load notifications",
            },
            {
                status: 500,
            },
        );
    }
}
