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
          title,
          test_type,
          total_sections,
          total_questions,
          total_marks,
          test_sections (
            subject_label
          )
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
    // Note: We extended the overrideTypes slightly to accommodate test_sections
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
            Array<DistributionRow & {
                tests: {
                    test_sections?: Array<{ subject_label: string }>
                }
            }>,
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
        items: rows.map((row) => {
            // Extract unique subjects from the test_sections join
            const rawSections = row.tests?.test_sections ?? [];
            const uniqueSubjects = Array.from(
                new Set(rawSections.map((sec) => sec.subject_label).filter(Boolean))
            );

            return {
                id: row.id,
                test_id: row.test_id,
                batch_id: row.batch_id,

                test_title: row.tests?.title ?? "Untitled Test",

                test_type: row.tests?.test_type ?? "standard",
                total_sections: row.tests?.total_sections ?? 0,
                total_questions: row.tests?.total_questions ?? 0,
                total_marks: row.tests?.total_marks ?? 0,

                // NEW: Added subject_labels array to frontend mapping
                subject_labels: uniqueSubjects,

                batch_name: row.batches?.title ?? null,
                starts_at: row.starts_at,
                ends_at: row.ends_at,

                status: computeDistributionStatus(
                    row.starts_at,
                    row.ends_at,
                ),

                duration_minutes: row.duration_minutes,
                created_at: row.created_at,
            };
        }),

        page: safePage,
        total: count ?? 0,
        totalPages: Math.ceil(
            (count ?? 0) / PAGE_SIZE,
        ),
        pageSize: PAGE_SIZE,
        currentUserId: staff.userId,
        isAdmin: staff.role === "admin",
    };
}
