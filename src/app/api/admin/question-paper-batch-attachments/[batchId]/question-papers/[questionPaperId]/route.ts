// app/api/admin/question-paper-batch-attachments/[batchId]/question-papers/[questionPaperId]/route.ts

import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

type RouteContext = {
    params: Promise<{
        batchId: string;
        questionPaperId: string;
    }>;
};

export async function DELETE(
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
            questionPaperId,
        } = await params;

        const supabase =
            await createServerSupabaseClient();

        const {
            error,
        } = await supabase
            .from(
                "batch_question_papers",
            )
            .delete()
            .eq(
                "batch_id",
                batchId,
            )
            .eq(
                "question_paper_id",
                questionPaperId,
            );

        if (
            error
        ) {
            console.error(
                "[DELETE_BATCH_QUESTION_PAPER_ATTACHMENT_ERROR]",
                error,
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to remove question paper from batch.",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
            },
        );
    } catch (
    error
    ) {
        console.error(
            "[DELETE_BATCH_QUESTION_PAPER_ATTACHMENT_FATAL]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to remove question paper from batch.",
            },
            {
                status: 500,
            },
        );
    }
}
