"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"
import { PagedTests, TestQueryParams } from "../types/test-pagination.types"
import { TestRow } from "../../../_features/types/test.types"

export async function getPagedTests(
    params: TestQueryParams
): Promise<PagedTests<TestRow>> {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    const { page, pageSize, search } = params
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from("tests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

    if (staff.role !== "admin") {
        query = query.eq("created_by", staff.id)
    }

    if (search && search.trim().length > 0) {
        query = query.ilike("title", `%${search}%`)
    }

    const { data, count, error } = await query

    if (error || !data || count === null) {
        throw new Error("FAILED_TO_LOAD_TESTS")
    }

    return {
        items: data as TestRow[],
        page,
        pageSize,
        total: count,
        hasMore: to + 1 < count
    }
}
