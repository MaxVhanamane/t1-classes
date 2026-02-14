"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import {
    DistributionQueryParams,
    DistributionRow,
    PagedDistributions,
} from "../types/distribution.types";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";

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
    const staff = await getCurrentStaff();
    const supabase = await createServerSupabaseClient();

    const { page, status, search } = params;

    /* -------------------------------------------- */
    /* Pagination */
    /* -------------------------------------------- */

    const baseSize = staff.role === "admin" ? ADMIN_PAGE_SIZE : DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(params.pageSize ?? baseSize, MAX_PAGE_SIZE);

    const safePage = Math.max(1, page);
    const from = (safePage - 1) * pageSize;
    const to = from + pageSize - 1;

    const now = new Date().toISOString();

    /* -------------------------------------------- */
    /* Base Query (INNER JOIN tests so search filters rows) */
    /* -------------------------------------------- */

    let query = supabase
        .from("test_distributions")
        .select(
            `
      id,
      test_id,
      batch_id,
      course_id,
      starts_at,
      ends_at,
      audience,
      duration_minutes,
      max_attempts,
      created_at,

      tests:tests!inner (
        title
      ),

      batches:batches (
        name
      ),

      courses:courses (
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

    if (staff.role !== "admin") {
        query = query.eq("created_by", staff.id);
    }

    /* -------------------------------------------- */
    /* Search — TEST TITLE ONLY */
    /* -------------------------------------------- */

    if (search && search.trim()) {
        query = query.ilike("tests.title", `%${search}%`);
    }

    /* -------------------------------------------- */
    /* Time-based Status Filtering (DB-side) */
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
                course_id: row.course_id,

                test_title: row.tests?.title ?? "Untitled Test",
                batch_name: row.batches?.name ?? null,
                course_title: row.courses?.title ?? null,

                starts_at: row.starts_at,
                ends_at: row.ends_at,

                status: computedStatus,
                audience: row.audience,
                duration_minutes: row.duration_minutes,
                max_attempts: row.max_attempts,
                created_at: row.created_at,
            };
        }),

        page: safePage,
        pageSize,
        total: count,
        hasMore: to + 1 < count,
    };
}
