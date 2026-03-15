import "server-only"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import {
    DistributionQueryParams,
    DistributionRow,
    PagedDistributions,
} from "../types/distribution.types";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";
import { getAuthIfHasRole } from "@/src/lib/auth/get-auth-if-has-role";
import { redirect } from "next/navigation";

/* -------------------------------------------- */
/* Config */
/* -------------------------------------------- */

const DEFAULT_PAGE_SIZE = 10;
const ADMIN_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

/* -------------------------------------------- */
/* Server Action */
/* -------------------------------------------- */

export async function getDistributionsByStatus(
    params: DistributionQueryParams
): Promise<PagedDistributions> {
    const user = await getAuthIfHasRole(["admin", "teacher"]);

    if (!user) {
        redirect("/login");
    }

    const supabase = await createServerSupabaseClient();

    const { page, status, search } = params;

    /* -------------------------------------------- */
    /* Pagination */
    /* -------------------------------------------- */

    const baseSize = user.role === "admin" ? ADMIN_PAGE_SIZE : DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(params.pageSize ?? baseSize, MAX_PAGE_SIZE);

    const safePage = Math.max(1, page);
    const from = (safePage - 1) * pageSize;
    const to = from + pageSize - 1;

    const now = new Date().toISOString();

    /* -------------------------------------------- */
    /* Base Query */
    /* -------------------------------------------- */

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

      tests:tests!inner (
        title
      ),

      batches:batches (
        title
      )
      `,
            { count: "exact" }
        )
        .order("starts_at", { ascending: false })
        .range(from, to);

    /* -------------------------------------------- */
    /* Role Filter */
    /* -------------------------------------------- */

    if (user.role !== "admin") {
        query = query.eq("created_by", user.userId);
    }

    /* -------------------------------------------- */
    /* Search — TEST TITLE ONLY */
    /* -------------------------------------------- */

    if (search && search.trim()) {
        query = query.ilike("tests.title", `%${search}%`);
    }

    /* -------------------------------------------- */
    /* Time-based Status Filtering */
    /* -------------------------------------------- */

    if (status === "scheduled") {
        query = query.gt("starts_at", now);
    }

    if (status === "ongoing") {
        query = query.lte("starts_at", now).gte("ends_at", now);
    }

    if (status === "completed") {
        query = query.lt("ends_at", now);
    }

    /* -------------------------------------------- */
    /* Execute */
    /* -------------------------------------------- */

    const { data, count, error } = await query;

    if (error || !data || count === null) {
        console.error("[GET_DISTRIBUTIONS]", error);
        throw new Error("FAILED_TO_LOAD_DISTRIBUTIONS");
    }

    const rows = data as unknown as DistributionRow[];

    /* -------------------------------------------- */
    /* Map + Compute Status */
    /* -------------------------------------------- */

    return {
        items: rows.map((row) => {
            const computedStatus = computeDistributionStatus(
                row.starts_at,
                row.ends_at
            );

            return {
                id: row.id,
                test_id: row.test_id,
                batch_id: row.batch_id,

                test_title: row.tests?.title ?? "Untitled Test",
                batch_name: row.batches?.title ?? null,

                starts_at: row.starts_at,
                ends_at: row.ends_at,

                status: computedStatus,
                duration_minutes: row.duration_minutes,
                created_at: row.created_at,
            };
        }),

        page: safePage,
        pageSize,
        total: count,
        hasMore: to + 1 < count,
    };
}
