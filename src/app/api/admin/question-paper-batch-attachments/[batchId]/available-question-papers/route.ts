// app/api/admin/question-paper-batch-attachments/[batchId]/available-question-papers/route.ts

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type {
    QuestionPaper,
    QuestionPaperListResponse,
} from "@/src/app/admin/question-papers/_features/types/question-paper";

type QuestionPaperRow = {
    id: string;
    title: string;
    description: string | null;
    class_level: number | null;
    target_exam: string | null;
    subject: string | null;
    paper_category: "previous_year" | "practice";
    years: number[];
    file_path: string;
    file_size: number | null;
    created_at: string;
};

type RouteContext = {
    params: Promise<{
        batchId: string;
    }>;
};

export async function GET(
    request: NextRequest,
    { params }: RouteContext,
) {
    try {
        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const { batchId } =
            await params;

        const searchParams =
            request.nextUrl.searchParams;

        const search =
            searchParams.get(
                "search",
            ) ?? "";

        const targetExam =
            searchParams.get(
                "targetExam",
            ) ?? null;

        const subject =
            searchParams.get(
                "subject",
            ) ?? null;

        const category =
            searchParams.get(
                "category",
            ) ?? null;

        const classLevel =
            searchParams.get(
                "classLevel",
            ) ?? null;

        const page = Math.max(
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
            1,
        );

        const pageSize =
            Math.min(
                Math.max(
                    Number(
                        searchParams.get(
                            "pageSize",
                        ) ?? "20",
                    ),
                    1,
                ),
                100,
            );

        const from =
            (page - 1) *
            pageSize;

        const to =
            from +
            pageSize -
            1;

        const supabase =
            await createServerSupabaseClient();

        const {
            data:
            attachedRows,
            error:
            attachedError,
        } =
            await supabase
                .from(
                    "batch_question_papers",
                )
                .select(
                    "question_paper_id",
                )
                .eq(
                    "batch_id",
                    batchId,
                );

        if (
            attachedError
        ) {
            return NextResponse.json(
                {
                    message:
                        attachedError.message,
                },
                {
                    status: 500,
                },
            );
        }

        const attachedIds =
            attachedRows?.map(
                (
                    row,
                ) =>
                    row.question_paper_id,
            ) ?? [];

        let countQuery =
            supabase
                .from(
                    "question_papers",
                )
                .select(
                    "*",
                    {
                        count:
                            "exact",
                        head:
                            true,
                    },
                );

        let dataQuery =
            supabase
                .from(
                    "question_papers",
                )
                .select(`
          id,
          title,
          description,
          class_level,
          target_exam,
          subject,
          paper_category,
          years,
          file_path,
          file_size,
          created_at
        `);

        if (
            attachedIds.length >
            0
        ) {
            const excludedIds =
                `(${attachedIds
                    .map(
                        (
                            id,
                        ) =>
                            `"${id}"`,
                    )
                    .join(
                        ",",
                    )})`;

            countQuery =
                countQuery.filter(
                    "id",
                    "not.in",
                    excludedIds,
                );

            dataQuery =
                dataQuery.filter(
                    "id",
                    "not.in",
                    excludedIds,
                );
        }

        if (
            search.trim()
        ) {
            countQuery =
                countQuery.ilike(
                    "title",
                    `%${search.trim()}%`,
                );

            dataQuery =
                dataQuery.ilike(
                    "title",
                    `%${search.trim()}%`,
                );
        }

        if (
            targetExam
        ) {
            countQuery =
                countQuery.eq(
                    "target_exam",
                    targetExam,
                );

            dataQuery =
                dataQuery.eq(
                    "target_exam",
                    targetExam,
                );
        }

        if (
            classLevel
        ) {
            countQuery =
                countQuery.eq(
                    "class_level",
                    Number(
                        classLevel,
                    ),
                );

            dataQuery =
                dataQuery.eq(
                    "class_level",
                    Number(
                        classLevel,
                    ),
                );
        }

        if (
            subject
        ) {
            countQuery =
                countQuery.eq(
                    "subject",
                    subject,
                );

            dataQuery =
                dataQuery.eq(
                    "subject",
                    subject,
                );
        }

        if (
            category
        ) {
            countQuery =
                countQuery.eq(
                    "paper_category",
                    category,
                );

            dataQuery =
                dataQuery.eq(
                    "paper_category",
                    category,
                );
        }

        const [
            countResult,
            dataResult,
        ] =
            await Promise.all(
                [
                    countQuery,

                    dataQuery
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false,
                            },
                        )
                        .range(
                            from,
                            to,
                        ),
                ],
            );

        if (
            countResult.error
        ) {
            return NextResponse.json(
                {
                    message:
                        countResult
                            .error
                            .message,
                },
                {
                    status: 500,
                },
            );
        }

        if (
            dataResult.error
        ) {
            return NextResponse.json(
                {
                    message:
                        dataResult
                            .error
                            .message,
                },
                {
                    status: 500,
                },
            );
        }

        const totalCount =
            countResult.count ??
            0;

        const rows:
            QuestionPaperRow[] =
            Array.isArray(
                dataResult.data,
            )
                ? (dataResult.data as QuestionPaperRow[])
                : [];

        const items:
            QuestionPaper[] =
            rows.map(
                (
                    row,
                ) => ({
                    id: row.id,
                    title:
                        row.title,
                    description:
                        row.description,
                    class_level:
                        row.class_level,
                    target_exam:
                        row.target_exam as QuestionPaper["target_exam"],
                    subject:
                        row.subject as QuestionPaper["subject"],
                    paper_category:
                        row.paper_category,
                    years:
                        row.years ??
                        [],
                    file_path:
                        row.file_path,
                    file_size:
                        row.file_size,
                    created_at:
                        row.created_at,
                }),
            );

        const response: QuestionPaperListResponse =
        {
            items,
            totalCount,
            page,
            pageSize,
            totalPages:
                Math.ceil(
                    totalCount /
                    pageSize,
                ),
        };

        return NextResponse.json(
            response,
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load available question papers",
            },
            {
                status: 500,
            },
        );
    }
}
