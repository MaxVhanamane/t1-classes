import "server-only";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import {
    DistributionQueryParams,
    DistributionRow,
    PagedDistributions,
} from "../types/distribution.types";

import { computeDistributionStatus } from "../helpers/compute-distribution-status";

type StaffUser = {
    userId: string;

    role: string;
};

const PAGE_SIZE = 20;

export async function getDistributions(
    params: DistributionQueryParams,
    staff: StaffUser,
): Promise<PagedDistributions> {
    const supabase = await createServerSupabaseClient();

    const {
        page,
        status,
        search,
        createdBy,
    } = params;

    const safePage = Math.max(1, page);

    const from = (safePage - 1) * PAGE_SIZE;

    const to = from + PAGE_SIZE - 1;

    const now = new Date().toISOString();

    let query = supabase
        .from("test_distributions")
        .select(
            `
        id,
        test_id,
        batch_id,
        starts_at,
        ends_at,
        duration_minutes,
        created_at,
        created_by,

        tests:tests!inner (
          title
        ),

        batches (
          title
        )
      `,
            {
                count: "exact",
            },
        );

    /* ---------- Permissions ---------- */

    if (staff.role !== "admin") {
        query = query.eq(
            "created_by",
            staff.userId,
        );
    } else if (createdBy === "me") {
        query = query.eq(
            "created_by",
            staff.userId,
        );
    } else if (createdBy !== null) {
        query = query.eq(
            "created_by",
            createdBy,
        );
    }

    /* ---------- Search ---------- */

    if (search.trim()) {
        query = query.ilike(
            "tests.title",
            `%${search.trim()}%`,
        );
    }

    /* ---------- Status ---------- */

    switch (status) {
        case "scheduled":
            query = query.gt(
                "starts_at",
                now,
            );
            break;

        case "ongoing":
            query = query
                .lte("starts_at", now)
                .gte("ends_at", now);
            break;

        case "completed":
            query = query.lt(
                "ends_at",
                now,
            );
            break;
    }

    /* ---------- Execute ---------- */

    const {
        data,
        error,
        count,
    } = await query
        .order("starts_at", {
            ascending: false,
        })
        .range(from, to)
        .overrideTypes<
            DistributionRow[],
            {
                merge: false;
            }
        >();

    if (error) {
        throw new Error(
            error.message,
        );
    }

    const rows = data ?? [];

    return {
        items: rows.map((row) => ({
            id: row.id,

            test_id: row.test_id,

            batch_id: row.batch_id,

            test_title:
                row.tests?.title ??
                "Untitled Test",

            batch_name:
                row.batches?.title ??
                null,

            starts_at: row.starts_at,

            ends_at: row.ends_at,

            status:
                computeDistributionStatus(
                    row.starts_at,
                    row.ends_at,
                ),

            duration_minutes:
                row.duration_minutes,

            created_at:
                row.created_at,
        })),

        page: safePage,

        total: count ?? 0,

        totalPages: Math.ceil(
            (count ?? 0) / PAGE_SIZE,
        ),

        pageSize: PAGE_SIZE,

        currentUserId:
            staff.userId,

        isAdmin:
            staff.role === "admin",
    };
}
