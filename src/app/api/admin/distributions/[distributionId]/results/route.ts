import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"

import {
    ResultsSort,
    PagedResults,
    DistributionResultRow,
} from "@/src/app/admin/tests/distributions/[distributionId]/results/_features/types/results.types"
import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route"

const DEFAULT_PAGE_SIZE = 25
const ADMIN_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ distributionId: string }> }
) {

    try {

        const auth = await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const staff = auth.user;
        const supabase = await createServerSupabaseClient()

        const body = await req.json()

        const {
            page = 1,
            pageSize,
            search,
            sort = "name",
        } = body as {
            page: number
            pageSize?: number
            search?: string
            sort?: ResultsSort
        }

        const { distributionId } = await params

        const baseSize =
            staff.role === "admin" ? ADMIN_PAGE_SIZE : DEFAULT_PAGE_SIZE

        const size = Math.min(pageSize ?? baseSize, MAX_PAGE_SIZE)

        const safePage = Math.max(1, page)

        const from = (safePage - 1) * size
        const to = from + size - 1

        /* -------------------------------------------- */
        /* Role Protection */
        /* -------------------------------------------- */

        if (staff.role !== "admin") {

            const { data } = await supabase
                .from("test_distributions")
                .select("id")
                .eq("id", distributionId)
                .eq("created_by", staff.userId)
                .maybeSingle()

            if (!data) {
                return NextResponse.json(
                    { error: "NOT_AUTHORIZED" },
                    { status: 403 }
                )
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
     student:users!inner (
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
        if (search && search.trim()) {
            const clean = search.trim().replace(/"/g, "")
            const q = `%${clean}%`

            query = query.or(
                `full_name.ilike.${q},email.ilike.${q}`,
                { foreignTable: "student" }
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
            query = query.order("rank", { ascending: true })
        }

        if (sort === "score") {
            query = query.order("obtained_marks", { ascending: false })
        }

        if (sort === "time") {
            query = query.order("time_spent_seconds", { ascending: true })
        }

        /* -------------------------------------------- */
        /* Execute */
        /* -------------------------------------------- */

        const { data, count, error } = await query

        if (error || !data || count === null) {

            console.error("[ADMIN_RESULTS_API]", error)

            return NextResponse.json(
                { error: "FAILED_TO_LOAD_RESULTS" },
                { status: 500 }
            )
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

        const response: PagedResults = {
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
            pageSize: size,
            total: count,
            hasMore: to + 1 < count,
        }

        return NextResponse.json(response)

    } catch (err) {

        console.error("[ADMIN_RESULTS_API_FATAL]", err)

        return NextResponse.json(
            { error: "INTERNAL_SERVER_ERROR" },
            { status: 500 }
        )
    }
}
