import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import {
    DistributionResultRow,
    PagedResults,
    ResultsSort,
} from "@/src/app/admin/tests/distributions/[distributionId]/results/_features/types/results.types";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ distributionId: string }> },
) {
    try {
        const supabase = await createServerSupabaseClient();

        const { distributionId } = await params;

        const searchParams = req.nextUrl.searchParams;

        const page = Math.max(
            1,
            Number(searchParams.get("page") ?? "1"),
        );

        const pageSize = Number(
            searchParams.get("pageSize") ??
            DEFAULT_PAGE_SIZE,
        );

        const search =
            searchParams.get("search")?.trim() ?? "";

        const sort = (
            searchParams.get("sort") ?? "rank"
        ) as ResultsSort;

        const size = Math.min(
            Math.max(pageSize, 1),
            MAX_PAGE_SIZE,
        );

        const { data, error } = await supabase.rpc(
            "rpc_get_distribution_results",
            {
                p_distribution_id: distributionId,
                p_page: page,
                p_page_size: size,
                p_search: search || null,
                p_sort: sort,
            },
        );

        if (error) {
            console.error(
                "[ADMIN_RESULTS_RPC]",
                error,
            );

            return NextResponse.json(
                {
                    error: "FAILED_TO_LOAD_RESULTS",
                },
                {
                    status: 500,
                },
            );
        }

        const rows =
            (data as Array<{
                id: string;

                user_id: string;

                attempt_id: string;

                student_name: string;

                student_email: string | null;

                obtained_marks: number;

                total_marks: number;

                rank: number | null;

                percentile: number | null;

                correct_count: number;

                partial_correct_count: number;

                wrong_count: number;

                unanswered_count: number;

                completion_percentage: number;

                time_spent_seconds: number;

                submitted_at: string | null;

                total_count: number;
            }>) ?? [];

        const total =
            rows.length > 0
                ? Number(rows[0].total_count)
                : 0;

        const response: PagedResults = {
            items: rows.map(
                (row): DistributionResultRow => ({
                    id: row.id,

                    user_id: row.user_id,

                    attempt_id: row.attempt_id,

                    student_name: row.student_name,

                    student_email: row.student_email,

                    obtained_marks: Number(
                        row.obtained_marks,
                    ),

                    total_marks: Number(
                        row.total_marks,
                    ),

                    rank: row.rank,

                    percentile:
                        row.percentile !== null
                            ? Number(row.percentile)
                            : null,

                    correct_count:
                        row.correct_count,

                    partial_correct_count:
                        row.partial_correct_count,

                    wrong_count: row.wrong_count,

                    unanswered_count:
                        row.unanswered_count,

                    completion_percentage: Number(
                        row.completion_percentage,
                    ),

                    time_spent_seconds:
                        row.time_spent_seconds,

                    submitted_at:
                        row.submitted_at,
                }),
            ),

            page,

            pageSize: size,

            total,

            hasMore:
                page * size < total,
        };

        return NextResponse.json(response);
    } catch (err) {
        console.error(
            "[ADMIN_RESULTS_API_FATAL]",
            err,
        );

        return NextResponse.json(
            {
                error: "INTERNAL_SERVER_ERROR",
            },
            {
                status: 500,
            },
        );
    }
}
