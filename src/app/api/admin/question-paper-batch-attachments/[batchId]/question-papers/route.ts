// app/api/admin/question-paper-batch-attachments/[batchId]/question-papers/route.ts

import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

type RouteContext = {
    params: Promise<{
        batchId: string;
    }>;
};

export async function GET(
    _request: Request,
    { params }: RouteContext,
) {
    try {
        const auth =
            await requireAdminApiRoute();

        if (
            !auth.authorized
        ) {
            return auth.response;
        }

        const {
            batchId,
        } = await params;

        const supabase =
            await createServerSupabaseClient();

        const {
            data,
            error,
        } = await supabase
            .from(
                "batch_question_papers",
            )
            .select(`
        question_papers (
          id,
          title,
          class_level,
          target_exam,
          subject,
          description,
          paper_category,
          years,
          file_path,
          file_size,
          created_at
        )
      `)
            .eq(
                "batch_id",
                batchId,
            );

        if (
            error
        ) {
            console.error(
                "[GET_BATCH_QUESTION_PAPERS_ERROR]",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to load attached question papers.",
                },
                {
                    status: 500,
                },
            );
        }

        const items =
            (data ?? [])
                .map(
                    (row) =>
                        row.question_papers,
                )
                .filter(
                    Boolean,
                );

        return NextResponse.json(
            {
                items,
            },
        );
    } catch (
    error
    ) {
        console.error(
            "[GET_BATCH_QUESTION_PAPERS_FATAL]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load attached question papers.",
            },
            {
                status: 500,
            },
        );
    }
}
