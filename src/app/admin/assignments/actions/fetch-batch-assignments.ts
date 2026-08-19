"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import type {
    BatchAssignmentFilters,
    BatchAssignmentListResponse,
    BatchAssignmentRow,
} from "../_features/types/batch-assignments.types";

export async function fetchBatchAssignments(
    batchId: string,
    filters: BatchAssignmentFilters
): Promise<BatchAssignmentListResponse> {
    await requireStaffServerOnly();
    const supabase = await createServerSupabaseClient();
    const pageSize = 10;
    const from = (filters.page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("batch_homework_assignments")
        .select(
            `
      id,
      publish_date,
      due_date,
      is_solution_visible,
      auto_publish_solution_at,
      created_at,
      updated_at,
      creator:users!batch_homework_assignments_created_by_fkey(full_name),
      updater:users!batch_homework_assignments_updated_by_fkey(full_name),
      material:homework_materials!inner (
        id,
        title,
        homework_type,
        file_path,
        solution_file_path,
        chapter:homework_chapters!inner (
          id,
          subject,
          chapter_name
        )
      )
    `,
            { count: "exact" }
        )
        .eq("batch_id", batchId)
        .order("publish_date", { ascending: false })
        .range(from, to);

    if (filters.subject !== "all") {
        query = query.eq("material.chapter.subject", filters.subject);
    }

    if (filters.search) {
        query = query.ilike("material.title", `%${filters.search}%`);
    }

    const now = new Date().toISOString();

    // Updated to match the new type terminology
    if (filters.status === "scheduled") {
        query = query.gt("publish_date", now);
    } else if (filters.status === "ongoing") {
        query = query.lte("publish_date", now).gte("due_date", now);
    } else if (filters.status === "completed") {
        query = query.lt("due_date", now);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("[FETCH_ASSIGNMENTS_ERROR]", error.message);
        throw new Error("Failed to load assignments");
    }

    // Override Supabase type inference securely
    const items = (data as unknown) as BatchAssignmentRow[];

    return {
        items,
        total: count ?? 0,
        page: filters.page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
    };
}
