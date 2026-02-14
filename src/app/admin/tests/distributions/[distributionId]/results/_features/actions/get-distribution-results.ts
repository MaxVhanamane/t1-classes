"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"

import {
    ResultsQueryParams,
    PagedResults,
    DistributionResultRow,
} from "../types/results.types"

const DEFAULT_PAGE_SIZE = 25
const ADMIN_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

export async function getDistributionResults(
    params: ResultsQueryParams
): Promise<PagedResults> {
    const staff = await getCurrentStaff()
    const supabase = await createServerSupabaseClient()

    const {
        distributionId,
        page,
        search,
        sort = "name",
    } = params

    const baseSize =
        staff.role === "admin"
            ? ADMIN_PAGE_SIZE
            : DEFAULT_PAGE_SIZE

    const pageSize = Math.min(
        params.pageSize ?? baseSize,
        MAX_PAGE_SIZE
    )

    const safePage = Math.max(1, page)
    const from = (safePage - 1) * pageSize
    const to = from + pageSize - 1

    /* -------------------------------------------- */
    /* Role Protection */
    /* -------------------------------------------- */

    if (staff.role !== "admin") {
        const { data, error } = await supabase
            .from("test_distributions")
            .select("id")
            .eq("id", distributionId)
            .eq("created_by", staff.id)
            .maybeSingle()

        if (error || !data) {
            throw new Error("NOT_AUTHORIZED")
        }
    }

    /* -------------------------------------------- */
    /* Base Query */
    /* -------------------------------------------- */

    let query = supabase
        .from("test_results")
        .select(
            `
      id,
      user_id,
      attempt_id,
      obtained_marks,
      total_marks,
      correct_count,
      wrong_count,
      unanswered_count,
      time_spent_seconds,
      rank,
      evaluated_at,

      student:users (
        full_name,
        email
      )
    `,
            { count: "exact" }
        )
        .eq("distribution_id", distributionId)
        .range(from, to)

    /* -------------------------------------------- */
    /* Search */
    /* -------------------------------------------- */

    if (search && search.trim().length > 0) {
        const q = `%${search.trim()}%`

        query = query.or(
            `student.full_name.ilike.${q},student.email.ilike.${q}`
        )
    }

    /* -------------------------------------------- */
    /* Sorting */
    /* -------------------------------------------- */

    if (sort === "name") {
        query = query.order("full_name", {
            ascending: true,
            referencedTable: "student",
        })
    }

    if (sort === "rank") {
        query = query.order("rank", {
            ascending: true,
        })
    }

    if (sort === "score") {
        query = query.order("obtained_marks", {
            ascending: false,
        })
    }

    if (sort === "time") {
        query = query.order("time_spent_seconds", {
            ascending: true,
        })
    }

    /* -------------------------------------------- */
    /* Execute */
    /* -------------------------------------------- */

    const { data, count, error } = await query

    if (error || !data || count === null) {
        console.error("[GET_RESULTS]", error)
        throw new Error("FAILED_TO_LOAD_RESULTS")
    }

    /* -------------------------------------------- */
    /* Normalize */
    /* -------------------------------------------- */

    const rows = data as unknown as Array<{
        id: string
        user_id: string
        attempt_id: string
        obtained_marks: number
        total_marks: number
        correct_count: number
        wrong_count: number
        unanswered_count: number
        time_spent_seconds: number
        rank: number | null
        evaluated_at: string | null
        student?: {
            full_name: string
            email: string | null
        } | null
    }>

    return {
        items: rows.map(
            (row): DistributionResultRow => ({
                id: row.id,

                user_id: row.user_id,
                student_name: row.student?.full_name ?? "Unknown",
                student_email: row.student?.email ?? null,

                attempt_id: row.attempt_id,

                obtained_marks: Number(row.obtained_marks),
                total_marks: Number(row.total_marks),

                correct_count: row.correct_count,
                wrong_count: row.wrong_count,
                unanswered_count: row.unanswered_count,

                time_spent_seconds: row.time_spent_seconds,
                rank: row.rank,

                submitted_at: row.evaluated_at,
            })
        ),

        page: safePage,
        pageSize,
        total: count,
        hasMore: to + 1 < count,
    }
}
